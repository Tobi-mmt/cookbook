import type { Recipe } from '../../types';

const ingredients = {
	flour: { quantity: 400, unit: 'g', name: 'Mehl' },
	milk: { quantity: 750, unit: 'ml', name: 'Milch' },
	salt: { quantity: 1, unit: 'Prise', name: 'Salz' },
	egg: { quantity: 3, name: 'Eier' },
	water: { quantity: 1, unit: 'Schuss', name: 'Mineralwasser' }
};

export const pancake: Recipe = {
	id: 'd4ebaa7d1705a3c', // generated with "yarn get-random-id"
	meta: {
		portion: 12,
		duration: 20,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Pfannkuchen',
	image: '/recipes/pfannkuchen.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpAAAABXRUJQVlA4IIQAAABwAgCdASoPAAgAAUAmJbACdAYph8AO2AjGujsAAP7+OHHyfrvqMD1b/tu3Xx06SB9iXlpNxP6uGX7YpsNMMnREOVcRzIi+56KLxxsWjxhv+1ZF0FGXo+V4FUZNoRYd7GFtvxhxyHTv+NTP+DtW24k3f0Jw95eEZs59cyVQp/PUnIAAAAA=',

	steps: [
		{
			description:
				'Mehl, Milch, Eier und eine Prise Salz mit dem Handrührgerät zu einem glatten Teig verrühren, bis dieser leichte Blasen wirft.',
			linkedIngredients: [ingredients.flour, ingredients.milk, ingredients.egg, ingredients.salt]
		},
		{ description: 'Teig für ca. 30 Minuten im Kühlschrank ruhen lassen.' },
		{
			description:
				'Den Teig aus dem Kühlschrank nehmen, noch einen guten Schuss Mineralwasser hinzufügen und das Ganze nochmals kurz durchrühren.',
			linkedIngredients: [ingredients.water]
		},
		{
			description:
				'Die Pfannenkuchen in einer beschichteten Pfanne mit etwas Butter heraus braten, bis sie goldgelb sind.'
		}
	],
	ingredients: Object.values(ingredients)
};
