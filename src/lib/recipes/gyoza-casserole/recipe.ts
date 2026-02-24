import type { Recipe } from '../../../types';

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

const ingredients = {
	section1: { section: 'Auflauf' },
	gyoza: { quantity: 400, unit: 'g', name: 'Gyoza' },
	zucchini: { quantity: 1, name: 'Zucchini' },
	paprika: { quantity: 1, name: 'rote Paprika' },

	section2: { section: 'Curry-Erdnusssoße' },
	coconutMilk: { quantity: 400, unit: 'ml', name: 'Kokosmilch' },
	peanutButter: { quantity: 2, unit: 'EL', name: 'Erdnussbutter, cremig' },
	curryPowder: { quantity: 1, unit: 'TL', name: 'Currypulver' },
	paprikaPowder: { quantity: 1, unit: 'TL', name: 'Paprikapulver, edelsüß' },
	vegetableStock: { quantity: 100, unit: 'ml', name: 'Gemüsebrühe' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' },

	section3: { section: 'Zum Toppen' },
	springOnion: { quantity: 2, name: 'Frühlingszwiebeln' },
	sesame: { name: 'Sesam' },
	coriander: { name: 'Koriander' },
	chilliOil: { name: 'Chiliöl' },
	sesameOil: { quantity: 1, unit: 'TL', name: 'Sesamöl' }
};

export const gyozaCasserole: Recipe = {
	id: '7e07b43e779d747', // generated with "yarn get-random-id"
	meta: {
		portion: 3,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Gyoza-Auflauf',
	description: 'Knusprige Gyoza auf Gemüse in cremiger Curry-Erdnusssoße.',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRugAAABXRUJQVlA4INwAAACwBACdASoPABYAPm0qkkWkIqGYBABABsSyAE6ZQWoCEQGyBOL0pzo4Rn/F5ZMkAP77n3MO5P3JprpdsJcVhjAq4cDHDeq3ItqRRZ0rJPc984RRccDPR9ZgE24pqBjoxnj7i+HcE9v5J/xYVqvGfIXb1tRT6g0as+RNWX4UiSNXs/Cpno/pfIdueBYjg29AO6YH6ftrsbISZkZyLYNMkbXyONqnIq0O8MlqK0KMmP7hnRJWgyM4gbcioq82w+quMaXZwSFw9ByfnOoIoDnwRTZaJU7+6QT1aL+bWAAA',
	steps: [
		{ section: 'Vorbereitung' },
		{ description: 'Ofen auf 180 °C Umluft vorheizen.' },
		{
			description: 'Zucchini und Paprika würfeln.',
			linkedIngredients: [ingredients.zucchini, ingredients.paprika]
		},
		{
			description: 'Frühlingszwiebeln in Ringe schneiden.',
			linkedIngredients: [ingredients.springOnion]
		},

		{ section: 'Soße' },
		{
			description:
				'Kokosmilch, Erdnussbutter, Currypulver, Paprikapulver, Gemüsebrühe sowie Salz & Pfeffer in einer Schüssel glatt rühren.',
			linkedIngredients: [
				ingredients.coconutMilk,
				ingredients.peanutButter,
				ingredients.curryPowder,
				ingredients.paprikaPowder,
				ingredients.vegetableStock,
				ingredients.salt,
				ingredients.pepper
			]
		},

		{ section: 'Auflauf' },
		{
			description:
				'Zucchini und Paprika roh in eine große Auflaufform geben und mit der Soße vermengen.',
			linkedIngredients: [ingredients.zucchini, ingredients.paprika]
		},
		{
			description:
				'Gyoza gleichmäßig obenauf verteilen, leicht eindrücken und mit Sesamöl beträufeln.',
			linkedIngredients: [ingredients.gyoza, ingredients.sesameOil]
		},
		{
			description: 'Form abdecken (Deckel oder Alufolie) und 15 Minuten backen.'
		},
		{
			description:
				'Abdeckung entfernen und weitere 15 Minuten backen, bis die Gyoza goldbraun und knusprig sind.'
		},
		{
			description:
				'Mit Frühlingszwiebeln sowie Sesam, Koriander und Chiliöl toppen und sofort servieren.',
			linkedIngredients: [
				ingredients.springOnion,
				ingredients.sesame,
				ingredients.coriander,
				ingredients.chilliOil
			]
		}
	],

	ingredients: Object.values(ingredients)
};
