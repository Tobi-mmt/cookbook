import type { Recipe } from '../../types';

const ingredients = {
	cherry: { quantity: 1.5, unit: 'kg', name: 'Sauerkirschen (Tiefgefroren)' },
	rum: { quantity: 200, unit: 'ml', name: 'Rum 40 %' },
	sugar: { quantity: 225, unit: 'g', name: 'Zucker' },
	limonade: { quantity: 0.7, unit: 'L', name: 'Limonade' },
	bubbly: { quantity: 0.7, unit: 'L', name: 'Sekt' },
	wine: { quantity: 0.7, unit: 'L', name: 'Rotwein' }
};

export const cherryPunch: Recipe = {
	meta: {
		portion: 10,
		duration: 10,
		category: 'Getränke',
		nutritionType: 'Vegan'
	},
	title: 'Sauerkirschbowle',
	image: '/recipes/sauerkirschbowle.webp',
	steps: [
		{
			description: 'Kirschen zusammen mit Zucker und Rum in eine Schüssel geben und durchmischen.',
			linkedIngredients: [ingredients.cherry, ingredients.rum, ingredients.sugar]
		},
		{ description: 'Etwa 12h einziehen lassen und ab und zu herumrühren.' },
		{
			description: 'Den Rest in die Schüssel hinzugeben und servieren.',
			linkedIngredients: [ingredients.limonade, ingredients.bubbly, ingredients.wine]
		}
	],
	ingredients: Object.values(ingredients)
};
