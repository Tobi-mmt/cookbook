import type { Recipe } from '../../../types';

const ingredients = {
	onion: { quantity: 1, unit: '', name: 'Zwiebel rot' },
	butter: { quantity: 1, unit: 'EL', name: 'Butter' },
	flour: { quantity: 1, unit: 'EL', name: 'Mehl' },
	vegetableBroth: { quantity: 250, unit: 'ml', name: 'Gemüsebrühe' },
	cream: { quantity: 100, unit: 'ml', name: 'Sahne' },
	mustard: { quantity: 3, unit: 'EL', name: 'Senf' },
	wine: { quantity: 1, unit: 'Schuss', name: 'Weißwein' },
	dill: { quantity: 0.5, unit: 'Bund', name: 'Dill' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' },
	sugar: { quantity: 1, unit: 'Brise', name: 'Zucker' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const mustardDillSauce: Recipe = {
	id: '978ae850d6a8a7a', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 15,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Senf-Dill-Sauce',
	image: RecipeImage,
	description:
		'Die Senf-Dill-Sauce passt perfekt zu Fisch, Fleisch und Gemüse. Sie ist schnell und einfach zubereitet.',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqQAAABXRUJQVlA4IJgAAADQAgCdASoPAAoAAUAmJbACdDiM95EL0CLgIxa+mwDAAP7WK1Bu49zNLNu1iGoyTZciEDNtf/ebezAKVdfR5e02zKT5+Cc+Iz3jJJK32ZWsYZYrDA1R88Av6CpOcGWXUuo+axVq11wB8BOdQzTRqxO4b9NgYSl3u4Lhp7/5clQhMY85f/fXWGcP/icbM8Pmfct9HXh1y0AAAA==',
	steps: [
		{ description: 'Die Zwiebel schälen und fein hacken.', linkedIngredients: [ingredients.onion] },
		{
			description: 'Die Butter in einem Topf schmelzen und die Zwiebel darin glasig dünsten.',
			linkedIngredients: [ingredients.butter]
		},
		{
			description: 'Das Mehl darüber stäuben und kurz anschwitzen.',
			linkedIngredients: [ingredients.flour]
		},
		{
			description: 'Mit der Gemüsebrühe, Sahne und Wein ablöschen und aufkochen.',
			linkedIngredients: [ingredients.vegetableBroth, ingredients.cream, ingredients.wine]
		},
		{
			description: 'Den Senf unterrühren und die Sauce 5 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.mustard]
		},
		{
			description: 'Den Dill waschen, trocken schütteln und fein hacken.',
			linkedIngredients: [ingredients.dill]
		},
		{
			description: 'Den Dill und Zucker zur Sauce geben und mit Salz, Pfeffer abschmecken.',
			linkedIngredients: [ingredients.salt, ingredients.pepper, ingredients.sugar]
		}
	],
	ingredients: Object.values(ingredients)
};
