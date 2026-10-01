import { describe, expect, test } from 'vitest';
import { recipeInputSchema } from '../../recipeInput';
import type { ScrapedRecipe } from './extract';
import { parseDuration, toRecipeInput } from './toRecipeInput';

const scraped: ScrapedRecipe = {
	name: 'Brezel-Chips Rezept',
	description: 'Knusprig',
	yield: '4 Personen',
	prepTime: 'PT10M',
	cookTime: 'PT1H0M',
	categories: [],
	keywords: ['Snacks'],
	diets: [],
	ingredients: ['5 Laugenbrezeln', '4 EL BBQ-Sauce', '1 TL Butter', 'Salz'],
	instructions: [
		'Brezeln schneiden, mit BBQ-Sauce mischen.',
		'Butter schmelzen, zur Sauce geben, salzen.'
	]
};

describe('parseDuration', () => {
	test.each([
		['PT25M', 25],
		['PT1H10M', 70],
		['P1DT2H', 1560],
		['30 Minuten', 30],
		['1 Std. 15 Min.', 75],
		['PT0M', undefined],
		[undefined, undefined]
	])('%s', (value, expected) => {
		expect(parseDuration(value)).toBe(expected);
	});
});

describe('toRecipeInput', () => {
	test('maps a scraped recipe to a valid editor input', () => {
		const input = toRecipeInput(scraped, 'https://www.lecker.de/brezel-chips-1.html');
		expect(recipeInputSchema.safeParse(input).success).toBe(true);
		expect(input).toMatchObject({
			title: 'Brezel-Chips',
			description: 'Knusprig',
			sourceUrl: 'https://www.lecker.de/brezel-chips-1.html',
			portion: 4,
			duration: 70,
			category: 'Herzhaft',
			nutritionType: 'Vegetarisch'
		});
		expect(input.ingredients[1]).toEqual({
			clientId: 'import-1',
			kind: 'ingredient',
			quantity: 4,
			unit: 'EL',
			name: 'BBQ-Sauce'
		});
	});

	test('links ingredients mentioned in a step', () => {
		const [first, second] = toRecipeInput(scraped, 'https://example.com').steps;
		expect(first.links.map((link) => link.ingredientId)).toEqual(['import-0', 'import-1']);
		expect(second.links.map((link) => link.ingredientId)).toEqual(['import-2', 'import-3']);
	});

	test('keeps multiple sections and drops a single one', () => {
		const single = toRecipeInput(
			{ ...scraped, instructions: [{ section: 'Zubereitung', steps: ['A'] }] },
			'https://example.com'
		);
		expect(single.steps.map((step) => step.kind)).toEqual(['step']);

		const multiple = toRecipeInput(
			{
				...scraped,
				instructions: [
					{ section: 'Teig', steps: ['A'] },
					{ section: 'Füllung', steps: ['B'] }
				]
			},
			'https://example.com'
		);
		expect(multiple.steps.map((step) => [step.kind, step.text])).toEqual([
			['section', 'Teig'],
			['step', 'A'],
			['section', 'Füllung'],
			['step', 'B']
		]);
	});

	test('detects category and nutrition type', () => {
		const detect = (recipe: Partial<ScrapedRecipe>) => {
			const { category, nutritionType } = toRecipeInput(
				{ ...scraped, ...recipe },
				'https://example.com'
			);
			return [category, nutritionType];
		};
		expect(detect({ keywords: ['Hauptspeise', 'Schwein'] })).toEqual(['Herzhaft', 'Fleisch']);
		expect(detect({ ingredients: ['200 g Lachs'] })).toEqual(['Herzhaft', 'Fleisch']);
		expect(detect({ diets: ['VeganDiet'], categories: ['Salat'] })).toEqual(['Salat', 'Vegan']);
		expect(detect({ keywords: ['Kuchen', 'vegetarisch'] })).toEqual(['Süßspeise', 'Vegetarisch']);
		expect(detect({ keywords: ['Cocktail'] })).toEqual(['Getränke', 'Vegetarisch']);
		expect(detect({ ingredients: ['1 Süßkartoffel', 'Petersilie, gehackt'] })).toEqual([
			'Herzhaft',
			'Vegetarisch'
		]);
	});

	test('falls back to defaults', () => {
		const input = toRecipeInput(
			{ categories: [], keywords: [], diets: [], ingredients: ['Salz'], instructions: [] },
			'https://example.com'
		);
		expect(input).toMatchObject({ title: 'Importiertes Rezept', portion: 2, duration: 30 });
		expect(recipeInputSchema.safeParse(input).success).toBe(true);
	});
});
