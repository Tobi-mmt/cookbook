import type { Recipe } from '../../../types';

const ingredients = {
	cherry: { quantity: 1.5, unit: 'kg', name: 'Sauerkirschen (Tiefgefroren)' },
	rum: { quantity: 200, unit: 'ml', name: 'Rum 40 %' },
	sugar: { quantity: 225, unit: 'g', name: 'Zucker' },
	limonade: { quantity: 0.7, unit: 'L', name: 'Limonade' },
	bubbly: { quantity: 0.7, unit: 'L', name: 'Sekt' },
	wine: { quantity: 0.7, unit: 'L', name: 'Rotwein' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const cherryPunch: Recipe = {
	id: 'a1222bbc43739e7', // generated with "yarn get-random-id"
	meta: {
		portion: 10,
		duration: 10,
		category: 'Getränke',
		nutritionType: 'Vegan'
	},
	title: 'Sauerkirschbowle',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqgAAABXRUJQVlA4IJwAAABQAgCdASoPAAsAAUAmJQBOgMUy4Fpm821Tt9AA/vpOsC9BLIxNGpQm2BEG69cqU0ZhjDC/hJRg4eDlYLGkpDl4R407u2onYNAbql0y90u8/YHx8JN6Ab3bMPp5Ddzszgpfn/Vl+TH3gSITjxs1hv2ru+jhU5YXv8nNNL+x3H3lN69RsFJSQggLmSOLSjl3qGezbWR26apxawtAAAA=',

	steps: [
		{
			description: 'Kirschen zusammen mit Zucker und Rum in eine Schüssel geben und durchmischen.',
			linkedIngredients: [ingredients.cherry, ingredients.rum, ingredients.sugar]
		},
		{ description: 'Etwa 12h einziehen lassen und ab und zu herumrühren.' },
		{
			description: 'Den Rest in die Schüssel hinzugeben und servieren.',
			linkedIngredients: [ingredients.limonade, ingredients.bubbly, ingredients.wine]
		}
	],
	ingredients: Object.values(ingredients)
};
