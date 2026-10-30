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
  "steps": ["Linsen waschen.", { "section": "Zum Schluss" }, "Mit Koriander bestreuen."]
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
				{ kind: 'step', text: 'Linsen waschen.' },
				{ kind: 'section', text: 'Zum Schluss' },
				{ kind: 'step', text: 'Mit Koriander bestreuen.' }
			]
		});
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
