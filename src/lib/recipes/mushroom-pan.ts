import type { Recipe } from '../../types';

export const mushroomPan: Recipe = {
	meta: {
		portion: 4,
		duration: 60,
		category: 'Herzhaft',
		vegetarian: true,
		vegan: true
	},
	title: 'Pilzschmorpfanne',
	image: '/recipes/pilzschmorpfanne.webp',
	description: [
		'Spinat waschen und zusammen mit Zwiebeln und Knoblauch fein würfeln.',
		'Stiele aus den Champignons entfernen und diese fein hacken.',
		'Pilz­stiele, Knoblauch und Hälfte der Zwiebeln darin andünsten. Den Spinat nach und nach zugeben.',
		'Pilze mit Spinat-Mischung füllen.',
		'Paprika und Tomaten grob schneiden und zusammen mit dem Rest der Zwiebel in Pfanne leicht anbraten.',
		'Mit Gemüsebrühe ablöschen, Sahne, Zitronensaft und Thymian hinzugeben und mit Salz & Pfeffer würzen.',
		'Pilze in die Pfanne setzen und auf geringer Temperatur etwa 20 Minuten köcheln lassen.',
		'Mit Salzkartoffeln oder Kartoffelpüree servieren.'
	],
	ingredients: [
		{ section: 'Füllung' },
		{ quantity: 250, unit: 'g', name: 'frischer Blattspinat' },
		{ quantity: 2, name: 'Zwiebeln' },
		{ quantity: 1, name: 'Knoblauchzehe' },
		{ quantity: 150, unit: 'g', name: 'Riesenchampignons' },
		{ section: 'Soße' },
		{ quantity: 400, unit: 'g', name: 'Paprika' },
		{ quantity: 50, unit: 'g', name: 'getrocknete Tomaten' },
		{ quantity: 4, unit: 'TL', name: 'Thymian' },
		{ quantity: 1, unit: 'TL', name: 'Zitronensaft' },
		{ quantity: 150, unit: 'ml', name: 'vagane Sahne' },
		{ quantity: 150, unit: 'ml', name: 'Gemüsebrühe' }
	]
};
