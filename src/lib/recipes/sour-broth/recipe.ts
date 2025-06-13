import type { Recipe } from '../../../types';

const ingredients = {
	onion: { quantity: 1, name: 'Zwiebeln' },
	garlic: { quantity: 1, unit: 'Zehen', name: 'Knoblauch' },
	stock: { quantity: 500, unit: 'l', name: 'Gemüsebrühe' },
	flour: { quantity: 2, unit: 'EL', name: 'Mehl' },
	butter: { quantity: 1, unit: 'TL', name: 'Butter' },
	juniper: { quantity: 5, name: 'Wachholderbeeren' },
	cloves: { quantity: 3, name: 'Nelken' },
	bayLeaves: { quantity: 2, name: 'Lorbeerblätter' },
	tomatoMark: { quantity: 1, unit: 'EL', name: 'Tomatenmark' },
	hamSausage: { quantity: 100, unit: 'g', name: 'geräucherte Schinnkenwurst' },
	potatoes: { quantity: 250, unit: 'g', name: 'Kartoffeln oder Kartoffelsalat' },

	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const sourBroth: Recipe = {
	id: 'eb060a5a4557feb', // generated with "yarn get-random-id"
	meta: {
		portion: 3,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Saure Brühe',
	description:
		'Saure Brühe mit Kartoffeln und Schinkenwurst ist ein recht unbekanntes Gericht. Zur Resteverwertung können die Kartoffeln auch durch übrig gebliebenen Kartoffelsalat ersetzt werden.',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqQAAABXRUJQVlA4IJgAAADwAgCdASoPAAsAAUAmJbACdDiAN5EIict11ZG7AxjzyAD+86/2fev9oGbW4a83JfSzNZKnEPv6j3Lz0V5EhJOwACF/PiLchPW1cHAoO47ld892ZIzgw5T+ySYO09Ypq6ITMN5SSdj78juT6HSBsy55HCOfiNKf+/8TV2RP3eEbLEvznOf++LI6Mcbfx4RzCWhQ1tZAfQAAAA==',

	steps: [
		{
			description: 'Zwiebeln und Knoblauch schälen und fein hacken.',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{
			description: 'Mit etwas Butter in einem Topf goldgelb anbraten.'
		},
		{
			description: 'Mit der Hälfte der Brühe ablöschen.',
			linkedIngredients: [{ ...ingredients.stock, quantity: ingredients.stock.quantity / 2 }]
		},
		{
			description: 'In einem zweiten Topf etwas Butter schmelzen und das Mehl hinzugeben.',
			linkedIngredients: [ingredients.flour, ingredients.butter]
		},
		{
			description: 'Mit der restlichen Brühe ablöschen und mit einem Schneebesen gut verrühren.',
			linkedIngredients: [{ ...ingredients.stock, quantity: ingredients.stock.quantity / 2 }]
		},
		{
			description: 'Die Soße zu den Zwiebeln und dem Knoblauch geben.'
		},
		{
			description:
				'Wachholderbeeren in einem Mörser zerstoßen und zusammen mit den Nelken und den Lorbeerblättern in die Soße geben und etwas köcheln lassen.',
			linkedIngredients: [ingredients.juniper, ingredients.cloves, ingredients.bayLeaves]
		},
		{
			description:
				'Tomatenmark, Kartoffeln/Kartoffelsalat und Schinkenwurst hinzugeben und mit Salz und Pfeffer abschmecken.',
			linkedIngredients: [
				ingredients.tomatoMark,
				ingredients.potatoes,
				ingredients.hamSausage,
				ingredients.salt,
				ingredients.pepper
			]
		},
		{
			description: 'Wenn die Brühe nicht sauer genug ist, etwas Essig hinzugeben.'
		},
		{
			description: 'Mit Spätzle servieren.'
		}
	],
	ingredients: Object.values(ingredients)
};
