import { describe, expect, test } from 'vitest';
import { extractRecipe } from './extract';

const jsonLd = (data: unknown) =>
	`<html><head><script type="application/ld+json">${JSON.stringify(data)}</script></head></html>`;

describe('extractRecipe', () => {
	test('reads a JSON-LD @graph with @id references (chefkoch)', () => {
		const recipe = extractRecipe(
			jsonLd({
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'Recipe',
						name: 'Carbonara',
						description: 'SEO-Text',
						abstract: 'Cremig &amp; ohne Sahne',
						image: { '@id': '#image' },
						prepTime: 'PT15M',
						totalTime: 'PT25M',
						recipeYield: ['2', '2 Portionen'],
						keywords: 'Hauptspeise, Nudeln, Schwein',
						recipeIngredient: ['240 g Spaghetti', 'Salz'],
						recipeInstructions: [
							{
								'@type': 'HowToSection',
								name: 'Zubereitung',
								itemListElement: [
									{ '@type': 'HowToStep', text: 'Speck würfeln.' },
									{ '@type': 'HowToStep', text: 'Pasta kochen.' }
								]
							}
						]
					},
					{ '@type': 'ImageObject', '@id': '#image', url: 'https://img.example/carbonara.jpg' }
				]
			})
		);
		expect(recipe).toEqual({
			name: 'Carbonara',
			description: 'Cremig & ohne Sahne',
			image: 'https://img.example/carbonara.jpg',
			yield: '2 2 Portionen',
			totalTime: 'PT25M',
			prepTime: 'PT15M',
			cookTime: undefined,
			categories: [],
			keywords: ['Hauptspeise', 'Nudeln', 'Schwein'],
			diets: [],
			ingredients: ['240 g Spaghetti', 'Salz'],
			instructions: [{ section: 'Zubereitung', steps: ['Speck würfeln.', 'Pasta kochen.'] }]
		});
	});

	test('reads flat JSON-LD with image arrays and diets (lecker)', () => {
		const recipe = extractRecipe(
			jsonLd({
				'@context': 'https://schema.org',
				'@type': ['Recipe'],
				name: 'Brezel-Chips',
				image: [{ '@type': 'ImageObject', url: 'https://img.example/1x1.jpg' }],
				suitableForDiet: 'https://schema.org/VegetarianDiet',
				recipeYield: '4 Personen',
				recipeIngredient: ['5 Laugenbrezeln'],
				recipeInstructions: [{ '@type': 'HowToStep', name: 'Schritt 1', text: 'Schneiden.' }]
			})
		);
		expect(recipe).toMatchObject({
			image: 'https://img.example/1x1.jpg',
			diets: ['VegetarianDiet'],
			instructions: ['Schneiden.']
		});
	});

	test('splits a single instruction string into steps', () => {
		const recipe = extractRecipe(
			jsonLd({
				'@type': 'Recipe',
				name: 'Tee',
				recipeInstructions: '<p>Wasser kochen.</p><p>Aufgießen.</p>'
			})
		);
		expect(recipe?.instructions).toEqual(['Wasser kochen.', 'Aufgießen.']);
	});

	test('reads microdata and ignores properties of nested items', () => {
		const recipe = extractRecipe(`
			<div itemscope itemtype="https://schema.org/Recipe">
				<h1 itemprop="name">Pfannkuchen</h1>
				<div itemprop="author" itemscope itemtype="https://schema.org/Person">
					<span itemprop="name">Anna</span>
				</div>
				<img itemprop="image" src="/pancake.jpg">
				<meta itemprop="totalTime" content="PT20M">
				<span itemprop="recipeYield">4</span>
				<ul>
					<li itemprop="recipeIngredient">200 g Mehl</li>
					<li itemprop="recipeIngredient">2 Eier</li>
				</ul>
				<ol itemprop="recipeInstructions"><li>Verrühren.</li><li>Backen.</li></ol>
			</div>`);
		expect(recipe).toMatchObject({
			name: 'Pfannkuchen',
			image: '/pancake.jpg',
			totalTime: 'PT20M',
			yield: '4',
			ingredients: ['200 g Mehl', '2 Eier'],
			instructions: ['Verrühren.', 'Backen.']
		});
	});

	test('reads microformats h-recipe', () => {
		const recipe = extractRecipe(`
			<article class="h-recipe">
				<h1 class="p-name">Limonade</h1>
				<span class="p-yield">2 Gläser</span>
				<time class="dt-duration" datetime="PT5M">5 Minuten</time>
				<span class="p-ingredient">1 Zitrone</span>
				<div class="e-instructions">Auspressen.<br>Auffüllen.</div>
			</article>`);
		expect(recipe).toMatchObject({
			name: 'Limonade',
			yield: '2 Gläser',
			totalTime: 'PT5M',
			ingredients: ['1 Zitrone'],
			instructions: ['Auspressen.', 'Auffüllen.']
		});
	});

	test('returns undefined without recipe data', () => {
		expect(extractRecipe('<html><body><h1>Hallo</h1></body></html>')).toBeUndefined();
	});
});
