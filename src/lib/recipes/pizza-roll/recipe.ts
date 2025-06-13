import type { Recipe } from '../../../types';
const ingredients = {
	ham: { quantity: 200, unit: 'g', name: 'Schinken' },
	salami: { quantity: 200, unit: 'g', name: 'Salami' },
	mushrooms: { quantity: 1, unit: 'Glas', name: 'Champignons' },
	paprika: { quantity: 1, name: 'Paprika' },
	gouda: { quantity: 250, unit: 'g', name: 'Gouda, gerieben' },
	cream: { quantity: 1, unit: 'Becher', name: 'Schmand' },
	sourCream: { quantity: 1, unit: 'Becher', name: 'saure Sahne' },
	bread: { quantity: 10, name: 'Brötchen' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const pizzaRoll: Recipe = {
	id: '483c5d4d2907b24', // generated with "yarn get-random-id"
	meta: {
		portion: 8,
		duration: 20,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Pizzabrötchen',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRq4AAABXRUJQVlA4IKIAAABwAgCdASoPAAsAAUAmJbACdDBUiIcJvva7NvxAAP6qH8K8XSBhUafX3yq+dHUX+iGmT3MsRr2Ef5U8zNeVf+Pw3DW2QBGGt/stn5KGmZwkx0JCQqfk0CXXYTfPGBVTfFPuxZppqPVeDKKCM7sO67wSyVsiUdAfAvXQfDlZ2dHmCLG4Dki5e1kt5q/FF6L4ZKOQccxVP+TNMgEKYKyXLHfBAAA=',

	steps: [
		{ description: 'Brötchen in 2 Hälften zerschneiden.', linkedIngredients: [ingredients.bread] },
		{
			description: 'Schinken, Salami, Champignons und Paprika in kleine Quadrate schneiden.',
			linkedIngredients: [
				ingredients.ham,
				ingredients.salami,
				ingredients.mushrooms,
				ingredients.paprika
			]
		},
		{
			description:
				'Alle Zutaten vermischen, mit Salz und Pfeffer abschmecken und dick auf den Brötchenhälften verteilen.',
			linkedIngredients: [ingredients.gouda, ingredients.cream, ingredients.sourCream]
		},
		{ description: 'Bei 180 °C Umluft ca. 10 Minuten im Ofen auf mittlere Schiene backen.' }
	],
	ingredients: Object.values(ingredients)
};
