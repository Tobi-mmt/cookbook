import { describe, expect, test } from 'vitest';
import { findUnusedIngredients, recipeInputSchema, type RecipeInput } from './recipeInput';

const recipe: RecipeInput = {
	title: 'Dal',
	description: null,
	portion: 2,
	duration: 40,
	category: 'Herzhaft',
	nutritionType: 'Vegan',
	ingredients: [
		{ clientId: 's', kind: 'section', name: 'Basis' },
		{ clientId: 'a', kind: 'ingredient', name: 'Linsen', quantity: 200, unit: 'g' },
		{ clientId: 'b', kind: 'ingredient', name: 'Salz' }
	],
	steps: [{ kind: 'step', text: 'Linsen kochen', links: [{ ingredientId: 'a' }] }]
};

describe('recipeInputSchema', () => {
	test('accepts a valid recipe', () => {
		expect(recipeInputSchema.safeParse(recipe).success).toBe(true);
	});

	test('rejects links to unknown or section ingredients', () => {
		for (const ingredientId of ['unknown', 's']) {
			const result = recipeInputSchema.safeParse({
				...recipe,
				steps: [{ kind: 'step', text: 'x', links: [{ ingredientId }] }]
			});
			expect(result.success).toBe(false);
		}
	});

	test('rejects empty titles and recipes without steps', () => {
		expect(recipeInputSchema.safeParse({ ...recipe, title: '  ' }).success).toBe(false);
		expect(recipeInputSchema.safeParse({ ...recipe, steps: [] }).success).toBe(false);
	});
});

describe('findUnusedIngredients', () => {
	test('returns ingredients that are not linked to any step', () => {
		expect(findUnusedIngredients(recipe).map(({ name }) => name)).toEqual(['Salz']);
	});
});
