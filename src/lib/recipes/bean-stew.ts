import type { Recipe } from '../../types';

export const beanStew: Recipe = {
	meta: {
		portion: 2,
		duration: 60,
		category: 'Herzhaft',
		vegetarian: true,
		vegan: true
	},
	title: 'Bohneneintopf mit veganem Speck',
	image: '/recipes/bean-stew.webp',
	description: [
		'Zwiebeln, Karotten, Kartoffeln und Tofu würfeln.',
		'Öl in einen Topf geben und die Zwiebeln andüsten.',
		'Tofuwürfel und Rauchsalz dazu geben und alles scharf anbraten.',
		'Karotten und Kartoffeln mit in den Topf geben und ca. 2 Minuten mit anbraten.',
		'Mit der Gemüsebrühe ablöschen und ca. 10 Minuten köcheln lassen.',
		'Prinzessbohnen hinzugeben und alles weitere 15 Minuten köcheln lassen.',
		'Mit Bohnenkraut, Liebstöckel, Pfeffer und Rauchsalz abschmecken.',
		'Bon appétit!'
	],
	ingredients: [
		{ quantity: 1, unit: 'große', name: 'Zwiebel' },
		{ quantity: 125, unit: 'g', name: 'geräucherter Tofu oder vegane Räucherwurst' },
		{ quantity: 1, unit: 'EL', name: 'Rauchsalz' },
		{ quantity: 4, unit: 'große', name: 'Kartoffeln' },
		{ quantity: 3, unit: 'große', name: 'Karotten' },
		{ quantity: 1, unit: 'Liter', name: 'Gemüsebrühe' },
		{ quantity: 500, unit: 'g', name: 'Prinzessbohnen' },
		{ quantity: 1, unit: 'EL', name: 'Bohnenkraut' },
		{ quantity: 1, unit: 'TL', name: 'Liebstöckel' },
		{ unit: 'nach Bedarf', name: 'Pfeffer' }
	]
};
