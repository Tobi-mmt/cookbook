import type { Recipe } from '../../types';

export const rhubarbPie: Recipe = {
	meta: {
		portion: 10,
		duration: 30,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Rhabarberkuchen',
	image: '/recipes/rhabarberkuchen.webp',
	description: [
		'Rhabarber schälen und in kleine Stücke schneiden. Mit etwa 4 Esslöffel Zucker vermischen und einziehen lassen.',
		'Backform mit etwas Butter einfetten.',
		'Die Zutaten des Teiges in eine Schüssel geben und kräftig durchkneten.',
		'Teig ausrollen und in die Form geben.',
		'Teig mit Zimt bestreuen und die Semmelbrösel gleichmäßig verteilen.',
		'Die Zutaten vom Guss – außer der Schlagsahne – in einer Schüssel anrühren.',
		'Schlagsahne steif schlagen und ebenfalls in die Schüssel geben.',
		'Rhabarber in die Form mit dem Teig geben und den Guss darüber geben. Etwas Zimt darüber streuen.',
		'Den Kuchen nun auf der 2. Schiene von unten etwa 60 Minuten lang bei 160° C Umluft backen lassen.'
	],
	ingredients: [
		{ section: 'Teig' },
		{ quantity: 300, unit: 'g', name: 'Mehl' },
		{ quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },
		{ quantity: 80, unit: 'g', name: 'Zucker' },
		{ quantity: 1, name: 'Ei' },
		{ quantity: 50, unit: 'g', name: 'Margarine' },
		{ quantity: 1, unit: 'Hand voll', name: 'Semmelbrösel' },
		{ quantity: 1, unit: 'Spritzer', name: 'Milch' },
		{ name: 'Zimt' },
		{ section: 'Guss' },
		{ quantity: 1, unit: 'kg', name: 'Rhabarber' },
		{ quantity: 1, unit: 'EL', name: 'Mehl' },
		{ quantity: 3, name: 'Eier' },
		{ quantity: 1, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 2, unit: 'Becher', name: 'Schmand' },
		{ quantity: 1, unit: 'Becher', name: 'Schlagsahne' },
		{ quantity: 150, unit: 'g', name: 'Zucker' }
	]
};
