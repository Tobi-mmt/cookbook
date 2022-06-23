import type { Recipe } from '../../types';

const ingredients = {
	potato: { quantity: 200, unit: 'g', name: 'Kartoffeln' },
	lentil: { quantity: 200, unit: 'g', name: 'rote Linsen' },
	onion: { quantity: 1, unit: 'große', name: 'Zwiebel' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	tomato: { quantity: 30, unit: 'g', name: 'getrockene Tomaten' },
	ginger: { quantity: 30, unit: 'g', name: 'Ingwer' },
	curry: { quantity: 1, unit: 'EL', name: 'Curry' },
	cumin: { quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
	curcuma: { quantity: 1, unit: 'TL', name: 'Kurkuma' },
	chili: { unit: 'nach Bedarf', name: 'Chilliflocken' },
	water: { quantity: 0.2, unit: 'L', name: 'Wasser' }
};

export const dal: Recipe = {
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Dal',
	image: '/recipes/dal.webp',
	steps: [
		{
			description: 'Kartoffeln schälen und in Würfel schneiden.',
			linkedIngredients: [ingredients.potato]
		},
		{
			description: 'Zwiebel, Ingwer und Knoblauch schälen und schneiden.',
			linkedIngredients: [ingredients.onion, ingredients.ginger, ingredients.garlic]
		},
		{
			description:
				'Öl in einen Topf geben und Geschnittenes zusammen mit den Linsen und den Gewürzen scharf anbraten.',
			linkedIngredients: [
				ingredients.lentil,
				ingredients.curry,
				ingredients.chili,
				ingredients.cumin,
				ingredients.curcuma
			]
		},
		{ description: 'Etwas Öl hinzugeben und die Masse vermengen.' },
		{ description: 'Mit Wasser ablöschen.', linkedIngredients: [ingredients.water] },
		{ description: 'Kartoffeln und Tomaten hinzu geben.', linkedIngredients: [ingredients.tomato] },
		{
			description:
				'Alles köcheln lassen bis die Kartoffeln weich sind und gegebenfalls Wasser nachgeben, wenn es zu fest wird.'
		},
		{ description: 'Mit etwas Fladenbrot oder Reis servieren.' }
	],
	ingredients: Object.values(ingredients)
};
