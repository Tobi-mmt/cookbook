import type { Recipe } from '../../types';
const ingredients = {
	ham: { quantity: 200, unit: 'g', name: 'Schinken' },
	salami: { quantity: 200, unit: 'g', name: 'Salami' },
	mushrooms: { quantity: 1, unit: 'Glas', name: 'Champignons' },
	paprika: { quantity: 1, name: 'Paprika' },
	gouda: { quantity: 250, unit: 'g', name: 'Gouda, gerieben' },
	cream: { quantity: 1, unit: 'Becher', name: 'Schmand' },
	sourCream: { quantity: 1, unit: 'Becher', name: 'saure Sahne' },
	bread: { quantity: 10, name: 'Brötchen' }
};

export const pizzaRoll: Recipe = {
	meta: {
		portion: 8,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Pizzabrötchen',
	image: '/recipes/pizzabroetchen.webp',
	steps: [
		{ description: 'Brötchen in 2 Hälften zerschneiden.', linkedIngredients: [ingredients.bread] },
		{
			description: 'Schinken, Salami, Champignons und Paprika in kleine Quadrate schneiden.',
			linkedIngredients: [
				ingredients.ham,
				ingredients.salami,
				ingredients.mushrooms,
				ingredients.paprika
			]
		},
		{
			description:
				'Alle Zutaten vermischen, mit Salz und Pfeffer abschmecken und dick auf den Brötchenhälften verteilen.',
			linkedIngredients: [ingredients.gouda, ingredients.cream, ingredients.sourCream]
		},
		{ description: 'Bei 180 °C Umluft ca. 10 Minuten im Ofen auf mittlere Schiene backen.' }
	],
	ingredients: Object.values(ingredients)
};
