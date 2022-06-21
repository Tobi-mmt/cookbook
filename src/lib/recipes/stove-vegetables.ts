import type { Recipe } from '../../types';

const ingredients = {
	potato: { quantity: 4, name: 'große Kartoffeln' },
	zucchini: { quantity: 1, name: 'Zucchini' },
	carrot: { quantity: 5, name: 'Karotten' },
	onion: { quantity: 1, name: 'große Zwiebel' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	cheese: { quantity: 200, unit: 'g', name: 'Schafskäse' },
	wine: { quantity: 3, unit: 'EL', name: 'Rotwein' },
	vinegar: { quantity: 3, unit: 'EL', name: 'Essig' },
	orange: { quantity: 3, unit: 'EL', name: 'Orangensaft' },
	oil: { name: 'Rapsöl' }
};

export const stoveSegetables: Recipe = {
	meta: {
		portion: 3,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Ofengemüse in Rotweinmarinade',
	image: '/recipes/ofengemuese.webp',
	steps: [
		{ description: 'Gemüse waschen und schälen.' },
		{
			description:
				'Gemüse in sehr dünne Scheiben schneiden. Am besten man kann durch die Scheiben fast hindurch sehen.',
			linkedIngredients: [
				ingredients.potato,
				ingredients.zucchini,
				ingredients.carrot,
				ingredients.onion,
				ingredients.garlic
			]
		},
		{
			description:
				'Zusammen mit den Flüssigkeiten und den Gewürzen in eine große Schüssel geben und gut durchmischen. Mit Salz und Peffer abschmecken.',
			linkedIngredients: [ingredients.wine, ingredients.vinegar, ingredients.orange]
		},
		{
			description: 'Alles in eine Backform geben und den Käse darüber verteilen.',
			linkedIngredients: [ingredients.cheese]
		},
		{ description: 'Bei 225 °C Ober-Unterhitze für 30 Minuten backen.' },
		{ description: 'Mit frischem Baguette oder Brot servieren.' }
	],
	ingredients: Object.values(ingredients)
};
