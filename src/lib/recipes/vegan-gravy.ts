import type { Recipe } from '../../types';

export const veganGravy: Recipe = {
	meta: {
		portion: 5,
		duration: 30,
		category: 'Herzhaft',
		vegetarian: true,
		vegan: true
	},
	title: 'Vegane Bratensoße',
	image: '/recipes/bratensosse.webp',
	description: [
		'Zwiebel, Karotte und Champignons würfeln und in einem Topf mit Öl scharf anbraten, bis es braun wird.',
		'Margarine, Tomatenmark, Mehl und braunen Zucker dazugeben.',
		'Mit Rotwein, Gemüsebrühe und Sojasoße ablöschen.',
		'Rest unterrühren und  10 min bei niedriger Hitze köcheln lassen.',
		'Zum Schluss entweder die Soße durch ein feines Sieb passieren (400 ml) oder Lorbeerblatt und Wacholderbeeren entfernen und den Rest mit einem Mixer pürieren (600 ml)'
	],
	ingredients: [
		{ quantity: 1, name: 'rote Zwiebel' },
		{ quantity: 150, unit: 'g', name: 'Champignons' },
		{ quantity: 1, name: 'Karotte' },
		{ quantity: 2, unit: 'EL', name: 'Öl' },
		{ quantity: 1, unit: 'EL', name: 'Margarine' },
		{ quantity: 2, unit: 'EL', name: 'Tomatenmark' },
		{ quantity: 1, unit: 'EL', name: 'Mehl' },
		{ quantity: 2, unit: 'TL', name: 'brauner Zucker' },
		{ quantity: 50, unit: 'ml', name: 'Rotwein' },
		{ quantity: 400, unit: 'ml', name: 'Gemüsebrühe' },
		{ quantity: 1, unit: 'EL', name: 'Sojasauce' },
		{ quantity: 1, name: 'Lorbeerblatt' },
		{ quantity: 5, name: 'Wacholderbeeren' },
		{ quantity: 1, unit: 'TL', name: 'Thymian' },
		{ quantity: 2, unit: 'TL', name: 'Senf' },
		{ quantity: 0.5, unit: 'TL', name: 'Salz' },
		{ quantity: 1, unit: 'Prise', name: 'Pfeffer' }
	]
};
