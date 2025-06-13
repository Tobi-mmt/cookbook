import type { Recipe } from '../../../types';

const ingredients = {
	potato: { quantity: 200, unit: 'g', name: 'Kartoffeln' },
	lentil: { quantity: 200, unit: 'g', name: 'rote Linsen' },
	onion: { quantity: 1, unit: 'große', name: 'Zwiebel' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	tomato: { quantity: 30, unit: 'g', name: 'getrockene Tomaten' },
	ginger: { quantity: 30, unit: 'g', name: 'Ingwer' },
	curry: { quantity: 1, unit: 'EL', name: 'Curry' },
	cumin: { quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
	curcuma: { quantity: 1, unit: 'TL', name: 'Kurkuma' },
	chili: { unit: 'nach Bedarf', name: 'Chilliflocken' },
	water: { quantity: 0.2, unit: 'L', name: 'Wasser' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const dal: Recipe = {
	id: '9abdc64367c7ef9', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Dal',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRsgAAABXRUJQVlA4ILwAAADwAgCdASoPAA8AAUAmJbACdLoAfh4REJgaWi7/JZnvgAD++PV+3KOOPwufxUGAawsMe6nPwc+elGg4Z7a+bmvEPt4UfWooZ/svzorobFrN9Jr4JenNFwn4GjtG79j6gv6Dur4oDFQrhc+lOkWew01VW/YcD82HE92h6qTX3/PhZrN6e/ik/N/IxZWMRlwahQM96v9g4vAbT0l80TaKlCHHhavKUNhnMbfdDYbxbCe6mwXJ8qVNsiYqMAAAAA==',

	steps: [
		{
			description: 'Kartoffeln schälen und in Würfel schneiden.',
			linkedIngredients: [ingredients.potato]
		},
		{
			description: 'Zwiebel, Ingwer und Knoblauch schälen und schneiden.',
			linkedIngredients: [ingredients.onion, ingredients.ginger, ingredients.garlic]
		},
		{
			description:
				'Öl in einen Topf geben und Geschnittenes zusammen mit den Linsen und den Gewürzen scharf anbraten.',
			linkedIngredients: [
				ingredients.lentil,
				ingredients.curry,
				ingredients.chili,
				ingredients.cumin,
				ingredients.curcuma
			]
		},
		{ description: 'Etwas Öl hinzugeben und die Masse vermengen.' },
		{ description: 'Mit Wasser ablöschen.', linkedIngredients: [ingredients.water] },
		{ description: 'Kartoffeln und Tomaten hinzu geben.', linkedIngredients: [ingredients.tomato] },
		{
			description:
				'Alles köcheln lassen bis die Kartoffeln weich sind und gegebenfalls Wasser nachgeben, wenn es zu fest wird.'
		},
		{ description: 'Mit etwas Fladenbrot oder Reis servieren.' }
	],
	ingredients: Object.values(ingredients)
};
