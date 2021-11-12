import type { Recipe } from '../../types';

export const cherryPunch: Recipe = {
	meta: {
		portion: 10,
		duration: 10,
		category: 'Getränke',
		vegetarian: true,
		vegan: true
	},
	title: 'Sauerkirschbowle',
	image: '/recipes/sauerkirschbowle.webp',
	description: [
		'Kirschen zusammen mit Zucker und Rum in eine Schüssel geben und durchmischen.',
		'Etwa 12h einziehen lassen und ab und zu herumrühren.',
		'Den Rest in die Schüssel hinzugeben und servieren.'
	],
	ingredients: [
		{ quantity: 1.5, unit: 'kg', name: 'Sauerkirschen (Tiefgefroren)' },
		{ quantity: 200, unit: 'ml', name: 'Rum 40 %' },
		{ quantity: 225, unit: 'g', name: 'Zucker' },
		{ quantity: 0.7, unit: 'L', name: 'Limonade' },
		{ quantity: 0.7, unit: 'L', name: 'Sekt' },
		{ quantity: 0.7, unit: 'L', name: 'Rotwein' }
	]
};
