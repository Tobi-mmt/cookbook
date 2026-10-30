import { describe, expect, test } from 'vitest';
import { findUnusedIngredients, recipeInputSchema, type RecipeInput } from './recipeInput';

const recipe: RecipeInput = {
	title: 'Dal',
	description: null,
	portion: 2,
	duration: 40,
	categoryId: 5,
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

describe('recipe limits', () => {
	test('reject overly long texts and too many entries', () => {
		const base = {
			title: 'Dal',
			portion: 2,
			duration: 30,
			categoryId: 1,
			nutritionType: 'Vegan',
			ingredients: [],
			steps: [{ kind: 'step', text: 'Kochen', links: [] }]
		};
		const messages = (input: object) => {
			const result = recipeInputSchema.safeParse({ ...base, ...input });
			return result.success ? [] : result.error.issues.map(({ message }) => message);
		};
		expect(messages({ title: 'x'.repeat(201) })).toEqual([
			'Der Titel darf höchstens 200 Zeichen lang sein'
		]);
		expect(messages({ steps: [{ kind: 'step', text: 'x'.repeat(3001), links: [] }] })).toEqual([
			'Ein Schritt darf höchstens 3000 Zeichen lang sein'
		]);
		expect(messages({ portion: 1001 })).toEqual(['Höchstens 1000 Portionen']);
		expect(messages({ title: 'x'.repeat(200), portion: 1000, duration: 10000 })).toEqual([]);
	});
});
