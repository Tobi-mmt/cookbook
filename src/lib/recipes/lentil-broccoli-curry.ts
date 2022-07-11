import type { Recipe } from '../../types';

const ingredients = {
	lentil: { quantity: 100, unit: 'g', name: 'rote Linsen' },
	onion: { quantity: 1, unit: 'große', name: 'rote Zwiebel' },
	broccoli: { quantity: 100, unit: 'g', name: 'Brokkoli' },
	carrot: { quantity: 80, unit: 'g', name: 'Karotte' },
	garlic: { quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
	stock: { quantity: 200, unit: 'ml', name: 'Gemüsebrühe' },
	cocosMilk: { quantity: 200, unit: 'ml', name: 'Kokosmilch' },
	cocosOil: { quantity: 1, unit: 'EL', name: 'Kokosöl' },
	soy: { quantity: 1, unit: 'EL', name: 'Sojasauce' },
	curry: { quantity: 1, unit: 'TL', name: 'Curry' },
	cumin: { quantity: 0.5, unit: 'TL', name: 'Kurkuma' },
	kaffirLeafes: { quantity: 2, name: 'Kaffir-Limettenblätter' },
	fenugreekLeafes: { quantity: 0.5, unit: 'TL', name: 'Bockshornkleeblätter gemahlen' },
	chili: { unit: 'nach Bedarf', name: 'Chiliflocken' }
};

export const lentilBroccoliCurry: Recipe = {
	id: '1ff1f1079687389', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Linsencurry mit Brokkoli und Karotten',
	image: '/recipes/lentil-broccoli-curry.webp',
	steps: [
		{
			description: 'Linsen abspülen, bis sie nicht mehr schäumen.',
			linkedIngredients: [ingredients.lentil]
		},
		{ description: 'Zwiebel schälen und würfeln.', linkedIngredients: [ingredients.onion] },
		{
			description: 'Brokkoli waschen und in kleine Röschen teilen.',
			linkedIngredients: [ingredients.broccoli]
		},
		{
			description: 'Karotten schälen und in kleine Würfel schneiden.',
			linkedIngredients: [ingredients.carrot]
		},
		{ description: 'Knoblauch schälen und fein würfeln.', linkedIngredients: [ingredients.garlic] },
		{
			description:
				'Öl in einer Pfanne erhitzen und Zwiebeln, Knoblauch, Kaffirblätter, Chiliflocken, Curry und Kurkuma anbraten.',
			linkedIngredients: [
				ingredients.cocosOil,
				ingredients.kaffirLeafes,
				ingredients.chili,
				ingredients.curry,
				ingredients.cumin
			]
		},
		{
			description: 'Mit Gemüsebrühe ablöschen und Kokosmilch hinzugeben.',
			linkedIngredients: [ingredients.stock, ingredients.cocosMilk]
		},
		{ description: 'Linsen hinzugeben und 10 Minuten köcheln lassen.' },
		{
			description:
				'Bockshornkleeblätter und Sojasauce hinzugeben und weitere 10 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.fenugreekLeafes, ingredients.soy]
		},
		{ description: 'Karotten und Brokkoli hinzufügen und 3 Minuten köcheln lassen.' },
		{ description: 'Kaffirblätter entfernen und mit Salz und Pfeffer abschmecken.' },
		{ description: 'Auf Reis servieren.' }
	],
	ingredients: Object.values(ingredients)
};
