import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Soße' },
	tamarindPuree: { quantity: 1.5, unit: 'EL', name: 'Tamarindenpaste' },
	brownSugar: { quantity: 3, unit: 'EL', name: 'Brauner Zucker' },
	fishSauce: { quantity: 2, unit: 'EL', name: 'Fischsauce' },
	oysterSauce: { quantity: 1.5, unit: 'EL', name: 'Oyster Sauce' },

	section2: { section: 'Stir Fry' },
	noodles: { quantity: 125, unit: 'g', name: 'breite Reisnudeln' },
	oil: { quantity: 2, unit: 'EL', name: 'Pflanzöl' },
	onion: { quantity: 1.5, name: 'Zwiebeln' },
	springOnion: { quantity: 1.5, name: 'Frühlingszwiebeln' },
	garlic: { quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
	tofu: { quantity: 150, unit: 'g', name: 'Tofu' },
	eggs: { quantity: 2, name: 'Eier' },
	beansprouts: { quantity: 1.5, unit: 'Stk.', name: 'Sprossen' },
	peanuts: { quantity: 50, unit: 'g', name: 'Erdnüsse' },

	section3: { section: 'Anrichten' },
	chilli: { quantity: 1, unit: 'TL', name: 'Chilipulver' },
	lime: { quantity: 1, name: 'Limette' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const padThai: Recipe = {
	id: '59fe90dafd44a91', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Pad Thai',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRooAAABXRUJQVlA4IH4AAABQAgCdASoPAAgAAUAmJbACdHMAFQ55+MHNSAAA/t4EyNj+BV/Am82p7f1+j4/vM6viRtDc0tc4J4Ms+ZHudsTK73tqaphgvCeExKZMwZkbEH01+4JDNNjn9q/Yqdm3sZf/z3KpF6/PqJp96mi3OXSpd3nKBMq9jfH+rKm/gAA=',
	steps: [
		{ section: 'Vorbereitung' },
		{ description: 'Tofu in Würfel schneiden', linkedIngredients: [ingredients.tofu] },
		{
			description: 'Knoblauch und Zwiebeln klein schneiden',
			linkedIngredients: [ingredients.garlic, ingredients.onion]
		},
		{
			description: 'Frühlingszwiebeln in 2 cm große Stücke schneiden',
			linkedIngredients: [ingredients.springOnion]
		},
		{ description: 'Erdnüsse grob hacken', linkedIngredients: [ingredients.peanuts] },
		{
			description: 'Chilli hacken oder Chilipulver in eine Schüssel geben',
			linkedIngredients: [ingredients.chilli]
		},
		{ description: 'Limette vierteln', linkedIngredients: [ingredients.lime] },
		{ description: 'Etwas Sprossen und Frühlingszwiebeln in eine Schüssel zur Seite stellen' },
		{ section: 'Soße' },
		{
			description:
				'Tamarindenpaste, Brauner Zucker, Fischsauce und Oyster Sauce in einer Schüssel mischen.',
			linkedIngredients: [
				ingredients.tamarindPuree,
				ingredients.brownSugar,
				ingredients.fishSauce,
				ingredients.oysterSauce
			]
		},
		{ section: 'Stir Fry' },
		{ description: 'Reisnudeln 5 Minuten kochen.', linkedIngredients: [ingredients.noodles] },
		{
			description: 'Währenddessen Öl in einem großen Topf erhitzen.',
			linkedIngredients: [ingredients.oil]
		},
		{
			description: 'Knoblauch und Zwiebeln 30 Sekunden anbraten.',
			linkedIngredients: [ingredients.garlic, ingredients.onion]
		},
		{ description: 'Tofu 1,5 Minuten anbraten.', linkedIngredients: [ingredients.tofu] },
		{ description: 'In der Pfanne alles zur Seite schieben.' },
		{
			description: 'Dort nun die Eier als Rührei anbraten.',
			linkedIngredients: [ingredients.eggs]
		},
		{ description: 'Wenn das Ei nicht mehr klebrig ist, alles in der Pfanne vermischen.' },
		{
			description: 'Sprossen, Reisnudeln und Soße dazugeben und gut vermengen.',
			linkedIngredients: [ingredients.beansprouts, ingredients.tofu, ingredients.noodles]
		},
		{
			description:
				'Die Hälfte der Erdnüsse und die Frühlingszwiebeln dazugeben, vermengen und schnell vom Herd nehmen.'
		},

		{ section: 'Anrichten' },
		{
			description:
				'Anrichten und die restlichen Erdnüsse, Frühlingszwiebeln und Sprossen dazugeben.'
		},
		{ description: 'Zum Schluss die Limette und Chilipulver bereitstellen.' }
	],
	ingredients: Object.values(ingredients)
};
