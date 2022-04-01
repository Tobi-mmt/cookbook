import type { Recipe } from '../../types';

export const dal: Recipe = {
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Dal',
	image: '/recipes/dal.webp',
	description: [
		'Kartoffeln schälen und in Würfel schneiden.',
		'Zwiebel, Ingwer und Knoblauch schälen und schneiden.',
		'Öl in einen Topf geben und Geschnittenes zusammen mit den Linsen und den Gewürzen scharf anbraten.',
		'Etwas Öl hinzugeben und die Masser vermengen.',
		'Mit Wasser ablöschen.',
		'Kartoffeln und Tomaten hinzu geben.',
		'Alles köcheln lassen bis die Kartoffeln weich sind und gegebenfalls Wasser nachgeben, wenn es zu fest wird.',
		'Mit etwas Fladenbrot oder Reis servieren.'
	],
	ingredients: [
		{ quantity: 200, unit: 'g', name: 'Kartoffeln' },
		{ quantity: 200, unit: 'g', name: 'rote Linsen' },
		{ quantity: 1, unit: 'große', name: 'Zwiebel' },
		{ quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
		{ quantity: 30, unit: 'g', name: 'getrockene Tomaten' },
		{ quantity: 30, unit: 'g', name: 'Ingwer' },
		{ quantity: 1, unit: 'EL', name: 'Curry' },
		{ quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
		{ quantity: 1, unit: 'TL', name: 'Kurkuma' },
		{ unit: 'nach Bedarf', name: 'Chilliflocken' },
		{ quantity: 0.2, unit: 'L', name: 'Wasser' }
	]
};
