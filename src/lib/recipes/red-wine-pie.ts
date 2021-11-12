import type { Recipe } from '../../types';

export const redWinePie: Recipe = {
	meta: {
		portion: 7,
		duration: 70,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Rotweinkuchen',
	image: '/recipes/rotweinkuchen.webp',
	description: [
		'Backofen auf 180° vorheizen.',
		'Butter, Zucker und die Eier in einer Schüssel schaumig aufschlagen.',
		'Den Rest in einer extra Schüssel vermengen. Den Inhalt der ersten Schüssel unterheben.',
		'Backform mit etwas Butter einfetten und den Teig hineingeben.',
		'Die Form in den Ofen geben und 50–60 Minuten backen lassen.'
	],
	ingredients: [
		{ quantity: 250, unit: 'g', name: 'Butter' },
		{ quantity: 200, unit: 'g', name: 'Zucker' },
		{ quantity: 4, name: 'Eier' },
		{ quantity: 250, unit: 'g', name: 'Mehl' },
		{ quantity: 150, unit: 'g', name: 'Schokostreusel' },
		{ quantity: 3, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 1, unit: 'EL', name: 'Zimtpulver' },
		{ quantity: 1, unit: 'EL', name: 'Kakaopulver' },
		{ quantity: 125, unit: 'ml', name: 'Rotwein' },
		{ quantity: 1, unit: 'Pck.', name: 'Backpulver' }
	]
};
