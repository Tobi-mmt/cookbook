import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { reportCases, users } from '../db/schema';
import { saveRecipe } from '../recipes';
import { hasTestDatabase, useTestDatabase } from '../testing/db';
import { createTestCookbook, createTestUser, testInput } from '../testing/fixtures';
import { closeCasesOfDeletedTargets, createReport, reportSchema } from './reports';
import { moveRecipeToTrash } from '../trash';

describe.skipIf(!hasTestDatabase)('reports', () => {
	const handle = useTestDatabase();

	test('collects reports in one case, counts people once and puts copyright first', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const [reporter, unreliable] = [await createTestUser(db), await createTestUser(db)];
		await db.update(users).set({ unreliableReporter: true }).where(eq(users.id, unreliable.id));
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		await saveRecipe(db, 'r', testInput(), { cookbookId, userId: user.id });

		const report = (reason: 'spam' | 'copyright', userId: string | null, ipHash = 'ip') =>
			createReport(
				db,
				reportSchema.parse({
					targetType: 'recipe',
					targetId: 'r',
					reason,
					...(reason === 'copyright'
						? { originalUrl: 'https://example.com', isRightsHolder: true }
						: {})
				}),
				{ userId, email: null, ipHash }
			);

		const first = await report('spam', reporter.id);
		const again = await report('spam', reporter.id);
		await report('spam', unreliable.id);
		expect(again).toEqual({ caseId: (first as { caseId: number }).caseId, duplicate: true });
		let [found] = await db.select().from(reportCases);
		expect(found.priority).toBe(5);
		expect(found.snapshot).toMatchObject({ type: 'recipe', title: 'Dal' });

		await report('copyright', null, 'other-ip');
		[found] = await db.select().from(reportCases);
		expect(found.priority).toBe(1009);

		await moveRecipeToTrash(db, 'r', user.id);
		expect(await closeCasesOfDeletedTargets(db)).toBe(1);
	});

	test('requires the details of the reason', () => {
		const base = { targetType: 'recipe', targetId: 'r' };
		expect(reportSchema.safeParse({ ...base, reason: 'other' }).success).toBe(false);
		expect(reportSchema.safeParse({ ...base, reason: 'copyright' }).success).toBe(false);
		expect(reportSchema.safeParse({ ...base, reason: 'spam' }).success).toBe(true);
	});
});
