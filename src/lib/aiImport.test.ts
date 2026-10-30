import { describe, expect, test } from 'vitest';
import { aiPrompt, parseAiAnswer } from './aiImport';

const categories = [
	{ id: 1, name: 'Hauptgericht' },
	{ id: 2, name: 'Backen & Dessert' }
];

const answer = `Hier ist dein Rezept:

\`\`\`json
{
  "title": "Linsen-Dal",
  "description": null,
  "sourceUrl": "https://www.instagram.com/p/abc/",
  "portion": "4",
  "duration": 35,
  "category": "hauptgericht",
  "nutritionType": "vegan",
  "ingredients": [
    { "quantity": 200, "unit": "g", "name": "rote Linsen" },
    { "section": "Topping" },
    { "quantity": "0,5", "unit": "Bund", "name": "Koriander" },
    { "quantity": null, "unit": null, "name": "Salz" }
  ],
  "steps": [
    { "text": "Linsen waschen und mit Salz kochen.", "ingredients": ["Rote Linsen", "Salz", "Pfeffer"] },
    { "section": "Zum Schluss" },
    "Mit Koriander bestreuen."
  ]
}
\`\`\`
Guten Appetit!`;

describe('parseAiAnswer', () => {
	test('reads the recipe from an answer with code block and text around it', () => {
		const result = parseAiAnswer(answer, categories);
		expect('input' in result && result.input).toMatchObject({
			title: 'Linsen-Dal',
			sourceUrl: 'https://www.instagram.com/p/abc/',
			portion: 4,
			duration: 35,
			categoryId: 1,
			nutritionType: 'Vegan',
			ingredients: [
				{ kind: 'ingredient', name: 'rote Linsen', quantity: 200, unit: 'g' },
				{ kind: 'section', name: 'Topping' },
				{ kind: 'ingredient', name: 'Koriander', quantity: 0.5, unit: 'Bund' },
				{ kind: 'ingredient', name: 'Salz', quantity: null, unit: null }
			],
			steps: [
				{
					kind: 'step',
					text: 'Linsen waschen und mit Salz kochen.',
					links: [
						{ ingredientId: 'ai-0', quantity: null },
						{ ingredientId: 'ai-3', quantity: null }
					]
				},
				{ kind: 'section', text: 'Zum Schluss' },
				{ kind: 'step', text: 'Mit Koriander bestreuen.', links: [] }
			]
		});
	});

	test('links every ingredient only to the first step that uses it', () => {
		const result = parseAiAnswer(
			JSON.stringify({
				title: 'Suppe',
				portion: 2,
				duration: 10,
				category: 'Hauptgericht',
				nutritionType: 'Vegan',
				ingredients: [{ name: 'Zwiebel' }, { name: 'Brühe' }],
				steps: [
					{ text: 'Zwiebel anbraten.', ingredients: ['Zwiebel'] },
					{ text: 'Mit Brühe aufgießen.', ingredients: ['Zwiebel', 'Brühe'] }
				]
			}),
			categories
		);
		expect('input' in result && result.input.steps.map(({ links }) => links)).toEqual([
			[{ ingredientId: 'ai-0', quantity: null }],
			[{ ingredientId: 'ai-1', quantity: null }]
		]);
	});

	test('does not link short names to longer ingredients', () => {
		const result = parseAiAnswer(
			JSON.stringify({
				title: 'Soße',
				portion: 2,
				duration: 10,
				category: 'Hauptgericht',
				nutritionType: 'Vegetarisch',
				ingredients: [{ name: 'Weißwein' }, { name: 'Eier' }],
				steps: [{ text: 'Verrühren.', ingredients: ['Ei', 'eier'] }]
			}),
			categories
		);
		expect('input' in result && result.input.steps[0].links).toEqual([
			{ ingredientId: 'ai-1', quantity: null }
		]);
	});

	test('explains what is wrong', () => {
		expect(parseAiAnswer('Ich kann das Bild leider nicht lesen.', categories)).toEqual({
			error: expect.stringContaining('kein Rezept')
		});
		expect(parseAiAnswer('{"title": "", "steps": []}', categories)).toEqual({
			error: expect.stringContaining('Titel fehlt')
		});
	});
});

describe('aiPrompt', () => {
	test('lists the own categories and diets', () => {
		const prompt = aiPrompt(categories);
		expect(prompt).toContain('Hauptgericht | Backen & Dessert');
		expect(prompt).toContain('Vegan | Vegetarisch | Fisch | Fleisch');
	});
});
