import { describe, expect, test } from 'vitest';
import { saveRecipe } from './recipes';
import { searchRecipes } from './search';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { moveRecipeToTrash } from './trash';

describe.skipIf(!hasTestDatabase)('searchRecipes', () => {
	const handle = useTestDatabase();

	test('finds titles with typos and ingredients, but no deleted recipes', async () => {
		const { db } = handle;
		const user = await createTestUser(db, 'mona');
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		const options = { cookbookId, userId: user.id };
		await saveRecipe(db, 'soup', testInput('Bärlauchsuppe'), options);
		await saveRecipe(db, 'dal', testInput('Dal'), options);
		await saveRecipe(db, 'gone', testInput('Bärlauchpesto'), options);
		await moveRecipeToTrash(db, 'gone', user.id);

		const titles = async (query: string) =>
			(await searchRecipes(db, query)).map(({ title }) => title);
		expect(await titles('bärlauch')).toEqual(['Bärlauchsuppe']);
		expect(await titles('Bärlauchsupe')).toEqual(['Bärlauchsuppe']);
		expect(await titles('linsen')).toEqual(['Bärlauchsuppe', 'Dal']);
		expect(await titles('x')).toEqual([]);
		expect((await searchRecipes(db, 'dal'))[0]).toMatchObject({ author: 'mona' });
	});
});
