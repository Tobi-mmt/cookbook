import type { Recipe } from '../../types';

const ingredients = {
	butter: { quantity: 250, unit: 'g', name: 'Butter' },
	sugar: { quantity: 250, unit: 'g', name: 'Zucker' },
	vanillaSugar: { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' },
	egg: { quantity: 2, name: 'Eier' },
	flour: { quantity: 450, unit: 'g', name: 'Mehl' },
	bakingPowder: { quantity: 1, unit: 'TL', name: 'Backpulver' }
};

export const spritzBiscuits: Recipe = {
	id: '6d2781ecd5f402d', // generated with "yarn get-random-id"
	meta: {
		portion: 50,
		duration: 60,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Spritzgebäck',
	image: '/recipes/butter-s.webp',
	steps: [
		{ description: 'Backofen auf 180 °C Umluft vorheizen.' },
		{ description: 'Butter schaumig schlagen.', linkedIngredients: [ingredients.butter] },
		{
			description: 'Alle Zutaten in eine Schüssel geben und vermengen.',
			linkedIngredients: [
				ingredients.sugar,
				ingredients.vanillaSugar,
				ingredients.egg,
				ingredients.flour,
				ingredients.bakingPowder
			]
		},
		{ description: 'Wenn der Teig zu flüssig ist, mehr Mehl dazu geben.' },
		{
			description: 'Teig in Spritzbeutel geben und in gewünschter Form auf das Backpapier drücken.'
		},
		{ description: 'Backblech in Ofen geben und 15–20 Minuten backen lassen.' },
		{ description: 'Abkühlen lassen und optional ein Ende des Gebäcks in Schokolade tauchen.' }
	],
	ingredients: Object.values(ingredients)
};
