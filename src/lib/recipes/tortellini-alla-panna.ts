import type { Recipe } from '../../types';

export const tortelliniAllaPanna: Recipe = {
	meta: {
		portion: 3,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Tortellini alla panna',
	image: '/recipes/tortelini-sahne.webp',
	description: [
		'Die Tortellini nach Packungsanleitung kochen.',
		'Den gekochten Schinken in einer tiefen Pfanne mit Butter kurz anbraten',
		'2/3 der Sahne hineingeben und auf kleiner Stufe köcheln lassen.',
		'Wenn die Tortellini gar sind, in die Pfanne zur Schinkensahne geben und weiter köcheln lassen.',
		'In der Zwischenzeit in einer kleinen Schüssel das Eigelb, den Parmesan, Muskatnuss, Salz und die restliche Sahne verrühren und in die Pfanne geben',
		'Köcheln lassen, bis die Soße dickflüssig wird.',
		'Sofort servieren.'
	],
	ingredients: [
		{ quantity: 500, unit: 'g', name: 'frische Tortellini' },
		{ quantity: 600, unit: 'ml', name: 'Sahne' },
		{ quantity: 2, name: 'Eigelb' },
		{ quantity: 4, unit: 'EL', name: 'Parmesan, frisch geriebener' },
		{ quantity: 1, unit: 'TL', name: 'Muskat' }
	]
};
