import type { Recipe } from '../../types';

const ingredients = {
	water: { quantity: 200, unit: 'ml', name: 'warmes Wasser' },
	flour: { quantity: 360, unit: 'g', name: 'Mehl (Typ 405)' },
	salt: { quantity: 10, unit: 'g', name: 'Salz' },
	yeast: { quantity: 3, unit: 'g', name: 'Trockenhefe' }
};

export const pizzaDough: Recipe = {
	id: 'f30a3b728e281c9', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Pizzateig',
	image: '/recipes/pizzateig.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpQAAABXRUJQVlA4IIgAAABQAgCdASoPAAoAAUAmJYwCdAYt9y8K5FOS4kgA/pw7O+06/tVbT/eP4JYd0KBgJS9Abj5eBf3P3KvjzwZq3ZgM/W/Oe6s0oixVpeGkAi/P5qTdKSsFkIXulQYeMX0u0QxKh9Dg34hbmrXLSKk+aNV8wn/dD1TbnqHFdjv8AIDKconmDJv72AAA',

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
