import type { Recipe } from '../../types';

export const pepperMedaillon: Recipe = {
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft'
	},
	title: 'Medaillons in Pfefferrahmsoße',
	image: '/recipes/schweinemedaillons.webp',
	description: [
		'Buttergemüse in einen Topf geben und bei geringer Hitze auftauen lassen.',
		'Filet waschen, trocken tupfen und in gleichmäßige Scheiben schneiden, mit Salz und Pfeffer würzen und mit Bacon umwickeln.',
		'Filet in einer Pfanne mit heißem Öl von allen Seiten scharf anbraten, sodass das Fleisch medium wird.',
		'Gemüsebrühpulver in heißes Wasser rühren und zum Fleisch geben, zusammen mit Cremefine, Frischkäse und Pfefferkörner.',
		'Nach etwa 7 Minuten einkochen ist alles fertig.',
		'Dazu passen gut Nudeln oder Kroketten.'
	],
	ingredients: [
		{ quantity: 350, unit: 'g', name: 'Schweinefilet' },
		{ quantity: 250, unit: 'g', name: 'Buttergemüse' },
		{ quantity: 1, unit: 'Pck.', name: 'Speck' },
		{ quantity: 100, unit: 'ml', name: 'Brühe' },
		{ quantity: 0.5, unit: 'Flasche', name: 'Cremefine' },
		{ quantity: 1, unit: 'EL', name: 'Frischkäse' },
		{ quantity: 1, unit: 'TL', name: 'Pfefferkörner, eingelegt' },
		{ quantity: 1, unit: 'EL', name: 'Butter' }
	]
};
