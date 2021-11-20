import type { Recipe } from '../../types';

export const pizzaRoll: Recipe = {
	meta: {
		portion: 8,
		duration: 20,
		category: 'Herzhaft'
	},
	title: 'Pizzabrötchen',
	image: '/recipes/pizzabroetchen.webp',
	description: [
		'Bötchen in 2 Hälften zerschneiden.',
		'Schinken, Salami und Paprika in kleine Quadrate schneiden.',
		'Alle Zutaten vermischen, mit Salz und Pfeffer abschmecken und dick auf den Brötchenhälften verteilen.',
		'Bei 180 °C Umluft ca. 10 Minuten im Ofen auf mittlere Schiene backen.'
	],
	ingredients: [
		{ quantity: 200, unit: 'g', name: 'Schinken' },
		{ quantity: 200, unit: 'g', name: 'Salami' },
		{ quantity: 1, unit: 'Glas', name: 'Champignons' },
		{ quantity: 1, name: 'Paprika' },
		{ quantity: 250, unit: 'g', name: 'Gouda, gerieben' },
		{ quantity: 1, unit: 'Becher', name: 'Schmand' },
		{ quantity: 1, unit: 'Becher', name: 'saure Sahne' },
		{ quantity: 10, name: 'Brötchen' },
		{ name: ' Salz' },
		{ name: 'Pfeffer' }
	]
};
