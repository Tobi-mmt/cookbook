import { describe, expect, test } from 'vitest';
import { mapRecipe, mapRecipeInput, type RecipeRows } from './mapRecipe';

const rows: RecipeRows = {
	recipe: {
		id: 'abc',
		title: 'Saure Brühe',
		description: null,
		portion: 3,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Fleisch',
		image: null,
		sourceUrl: null,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	ingredients: [
		{
			id: 3,
			recipeId: 'abc',
			position: 2,
			kind: 'ingredient',
			name: 'Salz',
			quantity: null,
			unit: null
		},
		{
			id: 1,
			recipeId: 'abc',
			position: 0,
			kind: 'section',
			name: 'Brühe',
			quantity: null,
			unit: null
		},
		{
			id: 2,
			recipeId: 'abc',
			position: 1,
			kind: 'ingredient',
			name: 'Brühe',
			quantity: 500,
			unit: 'ml'
		}
	],
	steps: [
		{ id: 11, recipeId: 'abc', position: 1, kind: 'step', text: 'Salzen' },
		{ id: 10, recipeId: 'abc', position: 0, kind: 'step', text: 'Hälfte aufkochen' },
		{ id: 12, recipeId: 'abc', position: 2, kind: 'section', text: 'Servieren' }
	],
	stepIngredients: [
		{ stepId: 10, ingredientId: 2, position: 0, quantity: 250 },
		{ stepId: 11, ingredientId: 3, position: 1, quantity: null },
		{ stepId: 11, ingredientId: 2, position: 0, quantity: null }
	]
};

describe('mapRecipe', () => {
	test('maps rows to the frontend recipe in position order', () => {
		const recipe = mapRecipe(rows);
		expect(recipe.description).toBeUndefined();
		expect(recipe.ingredients).toEqual([
			{ section: 'Brühe', key: '1' },
			{ name: 'Brühe', quantity: 500, unit: 'ml', key: '2' },
			{ name: 'Salz', key: '3' }
		]);
		expect(recipe.steps).toEqual([
			{
				description: 'Hälfte aufkochen',
				linkedIngredients: [{ name: 'Brühe', quantity: 250, unit: 'ml', key: '2' }]
			},
			{
				description: 'Salzen',
				linkedIngredients: [
					{ name: 'Brühe', quantity: 500, unit: 'ml', key: '2' },
					{ name: 'Salz', key: '3' }
				]
			},
			{ section: 'Servieren' }
		]);
	});
});

describe('mapRecipeInput', () => {
	test('maps rows to the editor state with links by client id', () => {
		const input = mapRecipeInput(rows);
		expect(input.ingredients.map(({ clientId }) => clientId)).toEqual(['1', '2', '3']);
		expect(input.steps[0].links).toEqual([{ ingredientId: '2', quantity: 250 }]);
		expect(input.steps[1].links.map(({ ingredientId }) => ingredientId)).toEqual(['2', '3']);
	});
});
