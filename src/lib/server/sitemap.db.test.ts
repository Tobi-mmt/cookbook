import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { users } from './db/schema';
import { saveRecipe } from './recipes';
import { listSitemapPaths } from './sitemap';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

describe.skipIf(!hasTestDatabase)('listSitemapPaths', () => {
	const handle = useTestDatabase();

	test('lists content of accounts older than two weeks only and no empty cookbooks', async () => {
		const { db } = handle;
		const [old, young] = [await createTestUser(db, 'old'), await createTestUser(db, 'young')];
		await db
			.update(users)
			.set({ createdAt: new Date('2020-01-01') })
			.where(eq(users.id, old.id));
		const oldBook = await createTestCookbook(db, old.id, 'Alt');
		await createTestCookbook(db, old.id, 'Leer');
		const youngBook = await createTestCookbook(db, young.id, 'Jung');
		await saveRecipe(db, 'a', testInput('Suppe'), { cookbookId: oldBook.id, userId: old.id });
		await saveRecipe(db, 'b', testInput('Spam'), { cookbookId: youngBook.id, userId: young.id });

		const paths = (await listSitemapPaths(db)).map(({ path }) => path);
		expect(paths).toEqual(['/', '/@old', '/@old/alt', '/rezept/a/Suppe']);
	});
});
