import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { cookbookExports, cookbooks } from './db/schema';
import { deleteOldExports } from './cookbookExports';
import { createExport, findCurrentExports, loadPdfInput } from './cookbookPdf';
import { moveRecipeToTrash } from './trash';
import { saveRecipe } from './recipes';
import type { Storage } from './storage';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

describe.skipIf(!hasTestDatabase)('cookbook PDF', () => {
	const handle = useTestDatabase();
	const stored: string[] = [];
	const deleted: string[] = [];
	const storage: Storage = {
		putFile: async (pathname) => (stored.push(pathname), `/blob/${pathname}`),
		deleteFiles: async (urls) => void deleted.push(...urls),
		copyFile: async () => ''
	};

	test('renders once per state of the cookbook and replaces outdated PDFs', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id } = await createTestCookbook(db, user.id, 'Familienrezepte');
		const cookbook = (await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, id) }))!;
		for (const title of ['Dal', 'Linsensuppe', 'Gelöscht']) {
			await saveRecipe(db, title, testInput(title), { cookbookId: cookbook.id, userId: user.id });
		}
		await moveRecipeToTrash(db, 'Gelöscht', user.id);

		const input = await loadPdfInput(db, cookbook, 'https://kochbuchbande.de');
		expect(input.recipes.map(({ title }) => title)).toEqual(['Dal', 'Linsensuppe']);
		expect(input.cookbook.url).toBe(`https://kochbuchbande.de/@${user.username}/${cookbook.slug}`);

		const first = await createExport(db, storage, {
			cookbookId: cookbook.id,
			input,
			quality: 'lesen'
		});
		expect(first.pages).toBe(5);
		expect(stored.at(-1)).toMatch(/^exports\/cookbooks\/.+\/familienrezepte\.pdf$/);
		const again = await createExport(db, storage, {
			cookbookId: cookbook.id,
			input,
			quality: 'lesen'
		});
		expect(again.id).toBe(first.id);
		expect(stored).toHaveLength(1);
		expect(Object.keys(await findCurrentExports(db, cookbook.id, input))).toEqual(['lesen']);

		await saveRecipe(db, 'Curry', testInput('Curry'), { cookbookId: cookbook.id, userId: user.id });
		const changed = await loadPdfInput(db, cookbook, 'https://kochbuchbande.de');
		expect(await findCurrentExports(db, cookbook.id, changed)).toEqual({});
		await createExport(db, storage, { cookbookId: cookbook.id, input: changed, quality: 'lesen' });
		expect(deleted).toEqual([first.url]);
		expect(await db.select().from(cookbookExports)).toHaveLength(1);

		const later = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
		expect(await deleteOldExports(db, storage, later)).toBe(1);
		expect(await db.select().from(cookbookExports)).toHaveLength(0);
	}, 30_000);
});
