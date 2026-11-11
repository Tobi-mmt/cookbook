import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { describe, expect, test } from 'vitest';
import type { Recipe, RecipeImage } from '../../../types';
import { testCategories } from '../../testing/categories';
import { softImages } from '../../printLayout';
import { formatQuantity, joinNames, renderCookbookPdf } from './render';

const photo = (width: number, height: number) =>
	sharp(
		Buffer.from(
			`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g"><stop offset="0" stop-color="#e9b872"/><stop offset="1" stop-color="#8c3b2a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="50%" cy="50%" r="30%" fill="#f4efe6"/></svg>`
		)
	)
		.jpeg()
		.toBuffer();

const image = (width: number, height: number): RecipeImage => ({
	width,
	height,
	placeholder: '',
	variants: { avif: [], webp: [{ width, url: `/img/${width}x${height}.jpg` }] }
});

const recipe = (overrides: Partial<Recipe> & { id: string; title: string }): Recipe => ({
	meta: {
		portion: 4,
		duration: 45,
		category: testCategories.hauptgericht,
		nutritionType: 'Vegetarisch'
	},
	image: null,
	isNew: false,
	steps: [{ description: 'Alles verrühren und 20 Minuten backen.' }],
	ingredients: [{ name: 'Mehl', quantity: 200, unit: 'g' }],
	cookbook: { id: 'c', name: 'Unser Kochbuch', slug: 'unser-kochbuch', ownerUsername: 'tobi' },
	author: { username: 'mona', name: 'Mona' },
	updatedAt: new Date(),
	attribution: [],
	isUnchangedCopy: false,
	...overrides
});

const longSteps = Array.from({ length: 25 }, (_, index) => ({
	description: `Schritt ${index + 1}: Die Zwiebeln fein würfeln und in Butter glasig dünsten, dann den Reis dazugeben und unter Rühren anschwitzen, bis er glänzt. Mit Weißwein ablöschen.`
}));

const recipes = [
	recipe({
		id: 'salat',
		title: 'Bunter Linsensalat',
		meta: { portion: 2, duration: 20, category: testCategories.salat, nutritionType: 'Vegan' },
		description: 'Schnell gemacht und gut vorzubereiten.',
		image: image(2400, 1600),
		ingredients: [
			{ section: 'Salat' },
			{ name: 'Linsen', quantity: 250, unit: 'g' },
			{ name: 'Zitrone', quantity: 0.5 },
			{ section: 'Dressing' },
			{ name: 'Olivenöl', quantity: 1.5, unit: 'EL' },
			{ name: 'Salz und Pfeffer' }
		],
		steps: [
			{
				description: 'Linsen kochen.',
				linkedIngredients: [{ name: 'Linsen', quantity: 250, unit: 'g' }]
			},
			{ section: 'Dressing' },
			{ description: 'Öl und Zitrone verrühren.' }
		]
	}),
	recipe({
		id: 'risotto',
		title: 'Risotto mit sehr langer Anleitung',
		image: image(900, 700),
		steps: longSteps,
		attribution: [
			{
				recipeId: 'x',
				title: 'Omas Risotto',
				author: { username: 'oma', name: 'Oma' },
				exists: true
			}
		],
		sourceUrl: 'https://www.example.org/risotto'
	}),
	recipe({ id: 'pasta', title: 'Pasta ohne Bild' }),
	recipe({
		id: 'kuchen',
		title: 'Apfelkuchen',
		meta: {
			portion: 12,
			duration: 90,
			category: testCategories.backen,
			nutritionType: 'Vegetarisch'
		},
		image: {
			...image(1200, 800),
			license: 'CC-BY-4.0',
			author: 'Max Muster',
			sourceUrl: 'https://example.org/kuchen'
		}
	})
];

const readFile = async (url: string) => {
	const [width, height] = url
		.match(/(\d+)x(\d+)/)!
		.slice(1)
		.map(Number);
	return photo(width, height);
};

describe('renderCookbookPdf', () => {
	test('renders cover, contents, every recipe on its own pages and the license', async () => {
		const { pdf, pages } = await renderCookbookPdf(
			{
				cookbook: {
					name: 'Unser Kochbuch',
					url: 'https://kochbuchbande.de/@tobi/unser-kochbuch',
					members: ['Tobi', 'Mona']
				},
				recipes,
				cover: recipes[0].image,
				origin: 'https://kochbuchbande.de',
				now: new Date('2026-11-11T12:00:00Z')
			},
			'lesen',
			readFile
		);
		if (process.env.PDF_OUT) await writeFile(process.env.PDF_OUT, pdf);

		expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
		// cover, contents, salad, risotto on two pages, pasta, cake, about
		expect(pages).toBe(8);
	}, 30_000);
});

describe('softImages', () => {
	test('lists images printed smaller or left out', () => {
		expect(
			softImages([
				{ id: 'a', title: 'Scharf', image: image(2400, 1600) },
				{ id: 'b', title: 'Klein', image: image(900, 700) },
				{ id: 'c', title: 'Winzig', image: image(300, 200) },
				{ id: 'd', title: 'Ohne', image: null }
			])
		).toEqual([
			{ id: 'b', title: 'Klein', dpi: 241, omitted: false },
			{ id: 'c', title: 'Winzig', dpi: 0, omitted: true }
		]);
	});
});

test('formatQuantity uses fractions and the German decimal comma', () => {
	expect([0.5, 1.5, 2, 0.3, 0.75, 1.25].map(formatQuantity)).toEqual([
		'½',
		'1½',
		'2',
		'0,3',
		'¾',
		'1¼'
	]);
});

test('joinNames', () => {
	expect(joinNames(['Mona'])).toBe('Mona');
	expect(joinNames(['Anna', 'Mona', 'Tobi'])).toBe('Anna, Mona und Tobi');
});
