import type { Recipe } from '../../types';

export const pizzaDough: Recipe = {
	meta: {
		portion: 2,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Pizzateig',
	image: '/recipes/pizzateig.webp',
	description: [
		'Das Rezept ergibt Teig für 2 Pizzen.',
		'Das warme Wasser mit Salz und Hefe mischen.',
		'10 % des Mehls hinzugeben und gut verrühren.',
		'Direkt danach den Rest des Mehls hinzugeben und mit Knethaken durchkneten.',
		'Den Teig mit einem feuchten Tuch abdecken und 2 Stunden bei Zimmertemperatur stehen lassen.',
		'Forme den Teig in 2 Kugeln und lasse ihn weitere 6–8 Stunden ruhen.',
		'Danach übersteht der Teig bis zu 3 Tage, wenn er im Kühlschrank gelagert wird.'
	],
	ingredients: [
		{ quantity: 200, unit: 'ml', name: 'warmes Wasser' },
		{ quantity: 360, unit: 'g', name: 'Mehl (Typ 405)' },
		{ quantity: 10, unit: 'g', name: 'Salz' },
		{ quantity: 3, unit: 'g', name: 'Trockenhefe' }
	]
};
