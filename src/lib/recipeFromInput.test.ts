import { expect, test } from 'vitest';
import type { Recipe } from '../types';
import { recipeFromInput } from './recipeFromInput';
import { testCategories } from './testing/categories';

const base = {} as Omit<
	Recipe,
	'title' | 'meta' | 'image' | 'description' | 'sourceUrl' | 'ingredients' | 'steps'
>;

test('maps an editor input to the recipe shown on the page', () => {
	const recipe = recipeFromInput(
		{
			title: 'Dal',
			description: null,
			portion: 2,
			duration: 40,
			categoryId: 5,
			nutritionType: 'Vegan',
			ingredients: [
				{ clientId: 's', kind: 'section', name: 'Basis' },
				{ clientId: 'a', kind: 'ingredient', name: 'Linsen', quantity: 200, unit: 'g' }
			],
			steps: [
				{ kind: 'section', text: 'Kochen', links: [] },
				{ kind: 'step', text: 'Hälfte kochen', links: [{ ingredientId: 'a', quantity: 100 }] }
			]
		},
		null,
		testCategories.hauptgericht,
		base
	);
	expect(recipe.ingredients).toEqual([
		{ section: 'Basis', key: 's' },
		{ name: 'Linsen', key: 'a', quantity: 200, unit: 'g' }
	]);
	expect(recipe.steps).toEqual([
		{ section: 'Kochen' },
		{
			description: 'Hälfte kochen',
			linkedIngredients: [{ name: 'Linsen', key: 'a', quantity: 100, unit: 'g' }]
		}
	]);
});
