import type { Recipe } from '../../types';

const ingredients = {
	onion: { quantity: 1, unit: 'große', name: 'Zwiebel' },
	tofu: { quantity: 125, unit: 'g', name: 'geräucherter Tofu oder vegane Räucherwurst' },
	salt: { quantity: 1, unit: 'EL', name: 'Rauchsalz' },
	potato: { quantity: 4, unit: 'große', name: 'Kartoffeln' },
	carrot: { quantity: 3, unit: 'große', name: 'Karotten' },
	stock: { quantity: 1, unit: 'Liter', name: 'Gemüsebrühe' },
	bushBeans: { quantity: 500, unit: 'g', name: 'Prinzessbohnen' },
	savory: { quantity: 1, unit: 'EL', name: 'Bohnenkraut' },
	lovage: { quantity: 1, unit: 'TL', name: 'Liebstöckel' },
	pepper: { unit: 'nach Bedarf', name: 'Pfeffer' }
};
export const beanStew: Recipe = {
	id: '77832c8e46d83fa', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 60,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Bohneneintopf mit veganem Speck',
	image: '/recipes/bean-stew.webp',
	steps: [
		{
			description: 'Zwiebeln, Karotten, Kartoffeln und Tofu würfeln.',
			linkedIngredients: [
				ingredients.onion,
				ingredients.carrot,
				ingredients.potato,
				ingredients.tofu
			]
		},
		{ description: 'Öl in einen Topf geben und die Zwiebeln andüsten.' },
		{ description: 'Tofuwürfel und Rauchsalz dazu geben und alles scharf anbraten.' },
		{
			description: 'Karotten und Kartoffeln mit in den Topf geben und ca. 2 Minuten mit anbraten.'
		},
		{
			description: 'Mit der Gemüsebrühe ablöschen und ca. 10 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.stock]
		},
		{
			description: 'Prinzessbohnen hinzugeben und alles weitere 15 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.bushBeans]
		},
		{
			description: 'Mit Bohnenkraut, Liebstöckel, Pfeffer und Rauchsalz abschmecken.',
			linkedIngredients: [
				ingredients.savory,
				ingredients.lovage,
				ingredients.pepper,
				ingredients.salt
			]
		},
		{ description: 'Bon appétit!' }
	],
	ingredients: Object.values(ingredients)
};
