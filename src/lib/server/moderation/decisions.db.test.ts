import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../../types';
import { acceptInvitation } from '../invitations';
import { cookbooks, recipes, recipeVersions, reportCases, users } from '../db/schema';
import { saveRecipe } from '../recipes';
import { copyRecipe } from '../recipeTransfer';
import { hasTestDatabase, useTestDatabase } from '../testing/db';
import { createTestCookbook, createTestUser, testInput } from '../testing/fixtures';
import { createAppeal, decideCase, revertDecision } from './decisions';
import { createReport, reportSchema } from './reports';

describe.skipIf(!hasTestDatabase)('decisions', () => {
	const handle = useTestDatabase();
	const deleted: string[] = [];
	const storage = {
		putFile: async () => '',
		deleteFiles: async (urls: string[]) => void deleted.push(...urls),
		copyFile: async (_url: string, path: string) => `/blob/${path}`
	};
	const context = () => ({ db: handle.db, storage, origin: 'http://localhost', adminId: 'admin' });
	const image: RecipeImage = {
		width: 1,
		height: 1,
		placeholder: 'tiny',
		variants: { avif: [{ width: 1, url: '/blob/original.avif' }], webp: [] }
	};

	const openCase = async (
		targetType: 'image' | 'recipe' | 'cookbook' | 'user',
		targetId: string
	) => {
		const result = await createReport(
			handle.db,
			reportSchema.parse({ targetType, targetId, reason: 'spam' }),
			{ userId: null, email: null, ipHash: `ip-${targetId}` }
		);
		return (result as { caseId: number }).caseId;
	};

	test('removes an image everywhere, also from copies and versions', async () => {
		const { db } = handle;
		await db
			.insert(users)
			.values({ id: 'admin', name: 'Admin', email: 'admin@example.com', role: 'admin' });
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		await saveRecipe(db, 'r', testInput(), { cookbookId, userId: user.id, image });
		const copy = await copyRecipe(db, storage, { sourceId: 'r', cookbookId, userId: user.id });

		const caseId = await openCase('image', 'r');
		await decideCase(context(), caseId, {
			decision: 'remove_image',
			reason: 'Urheberrecht',
			includeCopies: true
		});

		const rows = await db.select().from(recipes);
		expect(rows.map(({ image }) => image)).toEqual([null, null]);
		const versions = await db.select().from(recipeVersions);
		expect(versions.every(({ snapshot }) => snapshot.image === null)).toBe(true);
		expect(deleted).toContain('/blob/original.avif');
		expect(deleted.some((url) => url.includes(copy.id))).toBe(true);
	});

	test('hides, reverts after an appeal and allows one appeal per person', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id, 'Spam');
		const caseId = await openCase('cookbook', cookbookId);
		await decideCase(context(), caseId, { decision: 'hide', reason: 'Werbung' });
		expect(
			(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, cookbookId) }))?.hiddenAt
		).not.toBeNull();

		const appeal = await createAppeal(db, { caseId, userId: user.id, reason: 'Ist kein Spam' });
		expect(appeal).toHaveProperty('caseId');
		expect(await createAppeal(db, { caseId, userId: user.id, reason: 'Nochmal' })).toHaveProperty(
			'error'
		);

		await revertDecision(context(), caseId);
		expect(
			(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, cookbookId) }))?.hiddenAt
		).toBeNull();
	});

	test('bans a person and hands shared cookbooks over', async () => {
		const { db } = handle;
		const [banned, other] = [await createTestUser(db), await createTestUser(db)];
		const alone = await createTestCookbook(db, banned.id, 'Allein');
		const shared = await createTestCookbook(db, banned.id, 'Gemeinsam');
		await acceptInvitation(db, shared.id, other.id);

		const caseId = await openCase('user', banned.id);
		await decideCase(context(), caseId, { decision: 'ban', reason: 'Beleidigungen' });

		expect((await db.query.users.findFirst({ where: eq(users.id, banned.id) }))?.banned).toBe(true);
		expect(
			(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, alone.id) }))?.hiddenAt
		).not.toBeNull();
		expect(
			(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, shared.id) }))?.ownerId
		).toBe(other.id);
		const decided = await db.query.reportCases.findFirst({ where: eq(reportCases.id, caseId) });
		expect(decided).toMatchObject({ status: 'done', decision: 'ban' });

		await revertDecision(context(), caseId);
		expect(
			(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, alone.id) }))?.hiddenAt
		).toBeNull();
	});
});
