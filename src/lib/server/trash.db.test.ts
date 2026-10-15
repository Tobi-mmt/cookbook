import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { recipes } from './db/schema';
import { saveRecipe } from './recipes';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { moveRecipeToTrash, purgeTrash, restoreRecipe } from './trash';

describe.skipIf(!hasTestDatabase)('trash', () => {
	const handle = useTestDatabase();
	const storage = {
		putFile: async () => '',
		deleteFiles: async () => {},
		copyFile: async () => ''
	};

	test('restores within 30 days and purges afterwards', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		for (const id of ['keep', 'old']) {
			await saveRecipe(db, id, testInput(id), { cookbookId, userId: user.id });
			await moveRecipeToTrash(db, id, user.id);
		}
		await restoreRecipe(db, 'keep');

		const later = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
		expect(await purgeTrash(db, storage, later)).toEqual({ recipes: 1, cookbooks: 0 });
		expect(await db.query.recipes.findFirst({ where: eq(recipes.id, 'old') })).toBeUndefined();
		expect(await db.query.recipes.findFirst({ where: eq(recipes.id, 'keep') })).toBeDefined();
	});
});
