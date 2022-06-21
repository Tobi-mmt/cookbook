import type { Recipe } from '../../types';

const ingredients = {
	water: { quantity: 200, unit: 'ml', name: 'warmes Wasser' },
	flour: { quantity: 360, unit: 'g', name: 'Mehl (Typ 405)' },
	salt: { quantity: 10, unit: 'g', name: 'Salz' },
	yeast: { quantity: 3, unit: 'g', name: 'Trockenhefe' }
};

export const pizzaDough: Recipe = {
	meta: {
		portion: 2,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Pizzateig',
	image: '/recipes/pizzateig.webp',
	steps: [
		{ description: 'Das Rezept ergibt Teig für 2 Pizzen.' },
		{
			description: 'Das warme Wasser mit Salz und Hefe mischen.',
			linkedIngredients: [ingredients.water, ingredients.salt, ingredients.yeast]
		},
		{
			description: '10 % des Mehls hinzugeben und gut verrühren.',
			linkedIngredients: [ingredients.flour]
		},
		{ description: 'Direkt danach den Rest des Mehls hinzugeben und mit Knethaken durchkneten.' },
		{
			description:
				'Den Teig mit einem feuchten Tuch abdecken und 2 Stunden bei Zimmertemperatur stehen lassen.'
		},
		{ description: 'Forme den Teig in 2 Kugeln und lasse ihn weitere 6–8 Stunden ruhen.' },
		{
			description: 'Danach übersteht der Teig bis zu 3 Tage, wenn er im Kühlschrank gelagert wird.'
		}
	],

	ingredients: Object.values(ingredients)
};
