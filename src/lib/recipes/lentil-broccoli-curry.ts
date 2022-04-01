import type { Recipe } from '../../types';

export const lentilBroccoliCurry: Recipe = {
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Linsencurry mit Brokkoli und Karotten',
	image: '/recipes/lentil-broccoli-curry.webp',
	description: [
		'Linsen abspülen, bis sie nicht mehr schäumen.',
		'Zwiebel schälen und würfeln.',
		'Brokkoli waschen und in kleine Röschen teilen.',
		'Karotten schälen und in kleine Würfel schneiden.',
		'Knoblauch schälen und fein würfeln.',
		'Öl in einer Pfanne erhitzen und Zwiebeln, Knoblauch, Kaffirblätter, Chiliflocken, Curry und Kurkuma anbraten.',
		'Mit Gemüsebrühe ablöschen und Kokosmilch hinzugeben.',
		'Linsen hinzugeben und 10 Minuten köcheln lassen.',
		'Bockshornkleeblätter und Tamari hinzugeben und weitere 10 Minuten köcheln lassen.',
		'Karotten und Brokkoli hinzufügen und 3 Minuten köcheln lassen.',
		'Kaffirblätter entfernen und mit Salz und Pfeffer abschmecken.',
		'Auf Reis servieren.'
	],
	ingredients: [
		{ quantity: 100, unit: 'g', name: 'rote Linsen' },
		{ quantity: 1, unit: 'große', name: 'rote Zwiebel' },
		{ quantity: 100, unit: 'g', name: 'Brokkolie' },
		{ quantity: 80, unit: 'g', name: 'Karotte' },
		{ quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
		{ quantity: 200, unit: 'ml', name: 'Gemüsebrühe' },
		{ quantity: 200, unit: 'ml', name: 'Kokosmilch' },
		{ quantity: 1, unit: 'EL', name: 'Kokosöl' },
		{ quantity: 1, unit: 'EL', name: 'Sojasauce' },
		{ quantity: 1, unit: 'TL', name: 'Curry' },
		{ quantity: 0.5, unit: 'TL', name: 'Kurkuma' },
		{ quantity: 2, name: 'Kaffir-Limettenblätter' },
		{ quantity: 0.5, unit: 'TL', name: 'Bockshornkleeblätter gemahlen' },
		{ unit: 'nach Bedarf', name: 'Chiliflocken' }
	]
};
