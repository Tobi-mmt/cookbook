import type { Recipe } from '../../types';

export const tarteFlambee: Recipe = {
	meta: {
		portion: 4,
		duration: 15,
		category: 'Herzhaft'
	},
	title: 'Flammkuchen',
	image: '/recipes/flammkuchen.webp',
	description: [
		'Backofen auf 250° vorheizen.',
		'Alle Zutaten für den Teig in eine Schüssel geben und gut durchkneten.',
		'Den Teig ganz dünn ausrollen.',
		'Schmand und Crème double mischen, würzen und dick auf dem Teig verstreichen.',
		'Zwiebeln schneiden und bei geringer Hitze in der Pfanne dünsten und zusammen mit dem Speck auf dem Belag verteilen.',
		'Im Backofen auf einem Blech (KEIN Gitter!) in der unteren Schiene 20 Minuten backen.',
		'Mit Schnittlauch Röllchen bestreut servieren.'
	],
	ingredients: [
		{ section: 'Teig' },
		{ quantity: 4, unit: 'EL', name: 'Öl' },
		{ quantity: 250, unit: 'ml', name: 'Wasser' },
		{ quantity: 2, unit: 'Prisen', name: 'Salz' },
		{ quantity: 500, unit: 'g', name: 'Mehl' },
		{ section: 'Belag' },
		{ quantity: 4, name: 'Zwiebeln' },
		{ quantity: 200, unit: 'g', name: 'Speck, gewürfelt' },
		{ quantity: 2, unit: 'Becher', name: 'Crème double' },
		{ quantity: 2, unit: 'Becher', name: 'Schmand' },
		{ name: 'Pfeffer' },
		{ name: 'Salz' },
		{ name: 'Schnittlauch' }
	]
};
