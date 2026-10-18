import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import type { RecipeInput } from '../recipeInput';
import { users } from './db/schema';
import {
	listIngredientLandings,
	loadIngredientLanding,
	searchLandings,
	similarity
} from './landings';
import { saveRecipe } from './recipes';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

const withIngredients = (title: string, names: string[]): RecipeInput => ({
	...testInput(title),
	ingredients: names.map((name, index) => ({
		clientId: String(index),
		kind: 'ingredient',
		name,
		quantity: null,
		unit: null
	})),
	steps: [{ kind: 'step', text: 'Kochen', links: [] }]
});

describe.skipIf(!hasTestDatabase)('ingredient landing pages', () => {
	const handle = useTestDatabase();

	test('list ingredients of at least two recipes, without basics', async () => {
		const { db } = handle;
		const user = await createTestUser(db, 'koch');
		await db
			.update(users)
			.set({ createdAt: new Date('2020-01-01') })
			.where(eq(users.id, user.id));
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		const options = { cookbookId, userId: user.id };
		await saveRecipe(
			db,
			'a',
			withIngredients('Dal', ['Rote Linsen (getrocknet)', 'Salz']),
			options
		);
		await saveRecipe(db, 'b', withIngredients('Suppe', ['rote Linsen', 'Salz', 'Möhre']), options);
		await saveRecipe(db, 'c', withIngredients('Salat', ['Möhre']), options);

		const landings = await listIngredientLandings(db);
		expect(landings.map(({ slug, count }) => [slug, count])).toEqual([
			['moehre', 2],
			['rote-linsen', 2]
		]);

		const page = await loadIngredientLanding(db, 'rote-linsen');
		expect(page?.title).toMatch(/^Rezepte mit [Rr]ote Linsen$/);
		expect(page?.recipes.map(({ id }) => id).sort()).toEqual(['a', 'b']);
		expect(await loadIngredientLanding(db, 'salz')).toBeNull();
	});

	test('finds the landing page of an ingredient despite typos', async () => {
		const { db } = handle;
		const user = await createTestUser(db, 'suche');
		await db
			.update(users)
			.set({ createdAt: new Date('2020-01-01') })
			.where(eq(users.id, user.id));
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		const options = { cookbookId, userId: user.id };
		await saveRecipe(db, 'z1', withIngredients('Zwiebelkuchen', ['Zwiebeln']), options);
		await saveRecipe(db, 'z2', withIngredients('Zwiebelsuppe', ['Zwiebeln']), options);

		for (const query of ['Zwiebeln', 'zwiebel', 'ziwbelen']) {
			expect((await searchLandings(db, query))[0]?.slug, query).toBe('zwiebeln');
		}
		expect(await searchLandings(db, 'Schokolade')).toEqual(
			expect.not.arrayContaining([expect.objectContaining({ slug: 'zwiebeln' })])
		);
	});
});

describe('similarity', () => {
	test('is high for typos and low for other words', () => {
		expect(similarity('ziwbelen', 'zwiebeln')).toBeGreaterThanOrEqual(0.6);
		expect(similarity('schokolade', 'zwiebeln')).toBeLessThan(0.6);
		expect(similarity('reis', 'mais')).toBeLessThan(0.6);
	});
});
