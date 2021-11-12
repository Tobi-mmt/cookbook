import type { Recipe } from '../../types';

export const nougatBar: Recipe = {
	meta: {
		portion: 80,
		duration: 120,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Nougatstangen',
	image: '/recipes/nougatstangen.webp',
	description: [
		'Backofen auf 190° Umluft vorheizen.',
		'Butter schaumig schlagen.',
		'Alle Zutaten – bis auf Mehl und gemahlene Haselnüsse – in eine Schüssel geben und vermengen.',
		'Mehl esslöffelweise unterrühren.',
		'Gemahlene Haselnüsse unterrühren.',
		'Teig in Spritzbeutel geben und in gerade Linien mit etwa 4 cm Länge auf das Backpapier drücken.',
		'Backblech in Ofen geben und 7–10 Minuten backen lassen.',
		'Abkühlen lassen.',
		'Nuss-Nougatmasse im Wasserbad erhitzen und auf der flachen Seite einer Stange verteilen und eine zweite Stange darauf drücken.',
		'Wieder abkühlen lassen.',
		'Schokolade und Kokosfett im Wasserbad erhitzen und die Enden der Stangen eintauchen.'
	],
	ingredients: [
		{ section: 'Teig' },
		{ quantity: 225, unit: 'g', name: 'Butter' },
		{ quantity: 100, unit: 'g', name: 'Puderzucker' },
		{ quantity: 1, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 3, name: 'Eigelb' },
		{ quantity: 1, unit: 'TL', name: 'Zimt' },
		{ quantity: 200, unit: 'g', name: 'Mehl' },
		{ quantity: 40, unit: 'g', name: 'Kakao' },
		{ quantity: 1, unit: 'TL', name: 'Backpulver' },
		{ quantity: 125, unit: 'g', name: 'gemahlene Haselnüsse' },
		{ section: 'Füllung' },
		{ quantity: 100, unit: 'g', name: 'Nuss-Nougatmasse' },
		{ section: 'Guss' },
		{ quantity: 150, unit: 'g', name: 'Zartbitterschokolade' },
		{ quantity: 30, unit: 'g', name: 'Kokosfett' }
	]
};
