import type { Recipe } from '../../types';

export const salmonPasta: Recipe = {
	meta: {
		portion: 5,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Lachsnudeln',
	image: '/recipes/lachsnudeln.webp',
	description: [
		'Zwiebeln und Knoblauch schneiden und leicht anbraten.',
		'Mit Weißwein ablöschen.',
		'Sahne, Schmelzkäse und Parmesan dazu geben.',
		'Lachs in Würfel schneiden, in eine Schale geben und mit dem Saft einer der Zitrone vermischen und kurz einziehen lassen.',
		'Lachs in einer Pfanne leicht anbraten.',
		'Lachs in den Topf geben und mit klarer Brühe (Pulver), Salz und Pfeffer würzen und alles auf geringer Hitze durchziehen lassen.',
		'Mit Bandnudeln servieren.'
	],
	ingredients: [
		{ quantity: 1, name: 'Zwiebel' },
		{ quantity: 1 / 2, name: 'Zitrone' },
		{ quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
		{ quantity: 450, unit: 'g', name: 'Spinat (TK)' },
		{ quantity: 200, unit: 'g', name: 'Lachs' },
		{ quantity: 100, unit: 'ml', name: 'Weißwein' },
		{ quantity: 100, unit: 'ml', name: 'Sahne' },
		{ quantity: 100, unit: 'g', name: 'Parmesan' },
		{ quantity: 200, unit: 'g', name: 'Schmelzkäse' },
		{ name: 'Brühe (Pulver)' },
		{ name: 'Salz' },
		{ name: 'Pfeffer' }
	]
};
