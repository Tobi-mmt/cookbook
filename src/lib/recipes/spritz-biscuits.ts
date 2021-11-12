import type { Recipe } from '../../types';

export const spritzBiscuits: Recipe = {
	meta: {
		portion: 50,
		duration: 60,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Spritzgebäck',
	image: '/recipes/butter-s.webp',
	description: [
		'Backofen auf 180° Umluft vorheizen.',
		'Butter schaumig schlagen.',
		'Alle Zutaten in eine Schüssel geben und vermengen.',
		'Wenn der Teig zu flüssig ist, mehr Mehl dazu geben.',
		'Teig in Spritzbeutel geben und in gewünschter Form auf das Backpapier drücken.',
		'Backblech in Ofen geben und 15–20 Minuten backen lassen.',
		'Abkühlen lassen und optional ein Ende des Gebäcks in Schokolade tauchen.'
	],
	ingredients: [
		{ quantity: 250, unit: 'g', name: 'Butter' },
		{ quantity: 250, unit: 'g', name: 'Zucker' },
		{ quantity: 1, unit: 'Pck.', name: 'Vanille-Zucker' },
		{ quantity: 2, name: 'Eier' },
		{ quantity: 450, unit: 'g', name: 'Mehl' },
		{ quantity: 1, unit: 'TL', name: 'Backpulver' }
	]
};
