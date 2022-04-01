import type { Recipe } from '../../types';

export const vanillaCroissant: Recipe = {
	meta: {
		portion: 50,
		duration: 60,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Vanillekipferl',
	image: '/recipes/vanillekipferl.webp',
	description: [
		'Backofen auf 150 °C Umluft vorheizen.',
		'Alle Zutaten in eine Schüssel geben und vermengen.',
		'Arbeitsfläche mit Mehl bestreuen und etwa 0,5 cm dicke und 5 cm lange Rollen formen, zu Kipferl biegen und auf dem Backblech verteilen.',
		'Backblech in Ofen geben und 15–25 Minuten backen lassen.',
		'Die noch heißen Kipferl im Vanille-Zucker-Gemisch wenden und danach abkühlen lassen.'
	],
	ingredients: [
		{ section: 'Teig' },
		{ quantity: 275, unit: 'g', name: 'Mehl' },
		{ quantity: 2, name: 'Eigelb' },
		{ quantity: 80, unit: 'g', name: 'Puderzucker' },
		{ quantity: 1, name: 'Vanilleschote' },
		{ quantity: 1, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 1, unit: 'Prise', name: 'Salz' },
		{ quantity: 150, unit: 'g', name: 'gemahlene Mandeln' },
		{ quantity: 200, unit: 'g', name: 'Butter' },
		{ section: 'Zum Bestreuen' },
		{ quantity: 2, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 50, unit: 'g', name: 'Zucker' }
	]
};
