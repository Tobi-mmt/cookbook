import type { Recipe } from '../../types';

const ingredients = {
	section1: { section: 'Teig' },
	flour: { quantity: 500, unit: 'g', name: 'Mehl' },
	water: { quantity: 250, unit: 'ml', name: 'Wasser' },
	oil: { quantity: 4, unit: 'EL', name: 'Öl' },
	salt: { quantity: 2, unit: 'Prisen', name: 'Salz' },

	section2: { section: 'Belag' },
	onion: { quantity: 4, name: 'Zwiebeln' },
	bacon: { quantity: 200, unit: 'g', name: 'Speck (gewürfelt)' },
	cremeDouble: { quantity: 2, unit: 'Becher', name: 'Crème double' },
	creme: { quantity: 2, unit: 'Becher', name: 'Schmand' },
	chive: { name: 'Schnittlauch' }
};

export const tarteFlambee: Recipe = {
	meta: {
		portion: 4,
		duration: 15,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Flammkuchen',
	image: '/recipes/flammkuchen.webp',
	steps: [
		{ description: 'Backofen auf 250 °C Ober-Unterhitze vorheizen.' },
		{
			description: 'Alle Zutaten für den Teig in eine Schüssel geben und gut durchkneten.',
			linkedIngredients: [ingredients.flour, ingredients.water, ingredients.oil, ingredients.salt]
		},
		{ description: 'Den Teig ganz dünn ausrollen.' },
		{
			description:
				'Schmand und Crème double mischen, mit Salz und Pfeffer würzen und dick auf dem Teig verstreichen.',
			linkedIngredients: [ingredients.creme, ingredients.cremeDouble]
		},
		{
			description:
				'Zwiebeln schneiden und bei geringer Hitze in der Pfanne dünsten und zusammen mit dem Speck auf dem Belag verteilen.',
			linkedIngredients: [ingredients.onion, ingredients.bacon]
		},
		{
			description:
				'Im Backofen auf einem Blech (KEIN Gitter!) in der unteren Schiene 20 Minuten backen.'
		},
		{ description: 'Mit Schnittlauch Röllchen bestreut servieren.' }
	],
	ingredients: Object.values(ingredients)
};
