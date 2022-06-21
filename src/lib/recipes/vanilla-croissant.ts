import type { Recipe } from '../../types';

const ingredients = {
	section1: { section: 'Teig' },
	flour: { quantity: 275, unit: 'g', name: 'Mehl' },
	egg: { quantity: 2, name: 'Eigelb' },
	powderSugar: { quantity: 80, unit: 'g', name: 'Puderzucker' },
	vanillaBean: { quantity: 1, name: 'Vanilleschote' },
	vanillaSugar: { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' },
	salt: { quantity: 1, unit: 'Prise', name: 'Salz' },
	almond: { quantity: 150, unit: 'g', name: 'gemahlene Mandeln' },
	butter: { quantity: 200, unit: 'g', name: 'Butter' },
	section2: { section: 'Zum Bestreuen' },
	vanillaSugar2: { quantity: 2, unit: 'Pck.', name: 'Vanillezucker' },
	sugar: { quantity: 50, unit: 'g', name: 'Zucker' }
};

export const vanillaCroissant: Recipe = {
	meta: {
		portion: 50,
		duration: 60,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Vanillekipferl',
	image: '/recipes/vanillekipferl.webp',
	steps: [
		{ description: 'Backofen auf 150 °C Umluft vorheizen.' },
		{
			description: 'Alle Zutaten für den Teig in eine Schüssel geben und vermengen.',
			linkedIngredients: [
				ingredients.flour,
				ingredients.egg,
				ingredients.powderSugar,
				ingredients.vanillaBean,
				ingredients.vanillaSugar,
				ingredients.salt,
				ingredients.almond,
				ingredients.butter
			]
		},
		{
			description:
				'Arbeitsfläche mit Mehl bestreuen und etwa 0,5 cm dicke und 5 cm lange Rollen formen, zu Kipferl biegen und auf dem Backblech verteilen.'
		},
		{ description: 'Backblech in Ofen geben und 15–25 Minuten backen lassen.' },
		{
			description: 'Zucker und Vanillezucker in eine Schüssel geben und durchmischen.',
			linkedIngredients: [ingredients.vanillaSugar2, ingredients.sugar]
		},
		{
			description:
				'Die noch heißen Kipferl im Vanillezucker-Gemisch wenden und danach abkühlen lassen.'
		}
	],
	ingredients: Object.values(ingredients)
};
