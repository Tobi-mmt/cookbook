import type { Recipe } from '../../types';

export const carrotSalad: Recipe = {
	meta: {
		portion: 7,
		duration: 40,
		category: 'Salat',
		nutritionType: 'Vegetarisch'
	},
	title: 'Karottensalat',
	image: '/recipes/carrot-salad.webp',
	description: [
		'Karotten waschen, schälen und in sehr feine Stifte schneiden. Am besten mit einer Küchenmaschine oder einer Reibe.',
		'Zitrone auspressen und den Saft mit den Karotten in eine Schüssel geben.',
		'Alle Zutaten bis auf die Sahne in die Schüssel geben und gut durchmischen.',
		'Mindestens 4h, am besten jedoch über Nacht durchziehen lassen.',
		'Danach Sahne hinzugeben, kräftig durchmischen und servieren.'
	],
	ingredients: [
		{ quantity: 1, unit: 'kg', name: 'Karotten' },
		{ quantity: 3, unit: 'EL', name: 'Sonnenblumenöl' },
		{ quantity: 1, unit: 'EL', name: 'Balsamicoessig' },
		{ quantity: 1, unit: 'EL', name: 'Weinessig' },
		{ quantity: 0.5, name: 'Zitrone' },
		{ quantity: 1, unit: 'kleine Tasse', name: 'Wasser' },
		{ quantity: 1, unit: 'TL', name: 'Zucker' },
		{ quantity: 0.5, unit: 'TL', name: 'Liebstöckel gemahlen' },
		{ name: 'Salz' },
		{ name: 'Pfeffer' },
		{ quantity: 1, unit: 'Becher', name: 'saure Sahne' }
	]
};
