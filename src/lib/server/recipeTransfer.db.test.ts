import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { recipes } from './db/schema';
import { getRecipe, saveRecipe } from './recipes';
import { copyRecipe, findCopies } from './recipeTransfer';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

describe.skipIf(!hasTestDatabase)('copyRecipe', () => {
	const handle = useTestDatabase();
	const storage = {
		putFile: async () => '',
		deleteFiles: async () => {},
		copyFile: async (_url: string, pathname: string) => `/blob/${pathname}`
	};

	test('keeps the copy chain and counts as unchanged until it is edited', async () => {
		const { db } = handle;
		const [mona, tobi, anna] = [
			await createTestUser(db, 'mona'),
			await createTestUser(db, 'tobi'),
			await createTestUser(db, 'anna')
		];
		const monas = await createTestCookbook(db, mona.id);
		const tobis = await createTestCookbook(db, tobi.id);
		const annas = await createTestCookbook(db, anna.id);
		await saveRecipe(db, 'soup', testInput('Bärlauchsuppe'), {
			cookbookId: monas.id,
			userId: mona.id,
			image: {
				width: 1,
				height: 1,
				placeholder: '',
				variants: { avif: [{ width: 1, url: '/blob/x/1.avif' }], webp: [] }
			}
		});

		const first = await copyRecipe(db, storage, {
			sourceId: 'soup',
			cookbookId: tobis.id,
			userId: tobi.id
		});
		const second = await copyRecipe(db, storage, {
			sourceId: first.id,
			cookbookId: annas.id,
			userId: anna.id
		});

		const copy = (await getRecipe(db, second.id))!.recipe;
		expect(copy.isUnchangedCopy).toBe(true);
		expect(copy.image?.variants.avif[0].url).toBe(`/blob/recipes/${second.id}/1.avif`);
		expect(copy.attribution.map(({ author }) => author?.username)).toEqual(['tobi', 'mona']);

		await saveRecipe(db, second.id, testInput('Meine Suppe'), {
			cookbookId: annas.id,
			userId: anna.id
		});
		expect((await getRecipe(db, second.id))!.recipe.isUnchangedCopy).toBe(false);
		const row = await db.query.recipes.findFirst({ where: eq(recipes.id, second.id) });
		expect(row?.copiedFromId).toBe(first.id);
	});
});

describe.skipIf(!hasTestDatabase)('findCopies', () => {
	const handle = useTestDatabase();

	test('finds the copies of a recipe in the given cookbooks only', async () => {
		const { db } = handle;
		const storage = {
			putFile: async () => '',
			deleteFiles: async () => {},
			copyFile: async (_url: string, path: string) => `/blob/${path}`
		};
		const [mona, tobi] = [await createTestUser(db), await createTestUser(db)];
		const monas = await createTestCookbook(db, mona.id);
		const tobis = await createTestCookbook(db, tobi.id);
		const other = await createTestCookbook(db, tobi.id, 'Anderes');
		await saveRecipe(db, 'soup', testInput('Suppe'), { cookbookId: monas.id, userId: mona.id });
		await copyRecipe(db, storage, { sourceId: 'soup', cookbookId: tobis.id, userId: tobi.id });

		expect(
			(await findCopies(db, 'soup', [tobis.id, other.id])).map(({ cookbookId }) => cookbookId)
		).toEqual([tobis.id]);
		expect(await findCopies(db, 'soup', [other.id])).toEqual([]);
	});
});
