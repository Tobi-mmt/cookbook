import type { Recipe } from '../../types';

const ingredients = {
	section1: { section: 'Teig' },
	butter: { quantity: 225, unit: 'g', name: 'Butter' },
	sugarPowder: { quantity: 100, unit: 'g', name: 'Puderzucker' },
	vanillaSugar: { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' },
	egg: { quantity: 3, name: 'Eigelb' },
	cinemon: { quantity: 1, unit: 'TL', name: 'Zimt' },
	flour: { quantity: 200, unit: 'g', name: 'Mehl' },
	cocoa: { quantity: 40, unit: 'g', name: 'Kakao' },
	bakingPowder: { quantity: 1, unit: 'TL', name: 'Backpulver' },
	hazelnut: { quantity: 125, unit: 'g', name: 'gemahlene Haselnüsse' },
	section2: { section: 'Füllung' },
	nougat: { quantity: 100, unit: 'g', name: 'Nuss-Nougatmasse' },
	section3: { section: 'Guss' },
	chocolate: { quantity: 150, unit: 'g', name: 'Zartbitterschokolade' },
	coconutFat: { quantity: 30, unit: 'g', name: 'Kokosfett' }
};

export const nougatBar: Recipe = {
	id: '7dc870e4888223c', // generated with "yarn get-random-id"
	meta: {
		portion: 80,
		duration: 120,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Nougatstangen',
	image: '/recipes/nougatstangen.webp',
	steps: [
		{ description: 'Backofen auf 190 °C Umluft vorheizen.' },
		{ description: 'Butter schaumig schlagen.', linkedIngredients: [ingredients.butter] },
		{
			description:
				'Alle Zutaten – bis auf Mehl und gemahlene Haselnüsse – in eine Schüssel geben und vermengen.',
			linkedIngredients: [
				ingredients.sugarPowder,
				ingredients.vanillaSugar,
				ingredients.egg,
				ingredients.cinemon,
				ingredients.cocoa,
				ingredients.bakingPowder
			]
		},
		{ description: 'Mehl esslöffelweise unterrühren.', linkedIngredients: [ingredients.flour] },
		{ description: 'Gemahlene Haselnüsse unterrühren.', linkedIngredients: [ingredients.hazelnut] },
		{
			description:
				'Teig in Spritzbeutel geben und in gerade Linien mit etwa 4 cm Länge auf das Backpapier drücken.'
		},
		{ description: 'Backblech in Ofen geben und 7–10 Minuten backen lassen.' },
		{ description: 'Abkühlen lassen.' },
		{
			description:
				'Nuss-Nougatmasse im Wasserbad erhitzen und auf der flachen Seite einer Stange verteilen und eine zweite Stange darauf drücken.',
			linkedIngredients: [ingredients.nougat]
		},
		{ description: 'Wieder abkühlen lassen.' },
		{
			description:
				'Schokolade und Kokosfett im Wasserbad erhitzen und die Enden der Stangen eintauchen.',
			linkedIngredients: [ingredients.chocolate, ingredients.coconutFat]
		}
	],
	ingredients: Object.values(ingredients)
};
