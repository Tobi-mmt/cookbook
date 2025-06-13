import type { Recipe } from '../../../types';

const ingredients = {
	onion: { quantity: 2, name: 'Zwiebeln' },
	garlic: { quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
	mangold: { quantity: 1, unit: 'Bund', name: 'Mangold' },
	whiteWine: { quantity: 150, unit: 'ml', name: 'Weißwein' },
	gorgonzola: { quantity: 200, unit: 'g', name: 'Grorgonzola' },
	tomato: { quantity: 200, unit: 'g', name: 'Baby-Tomaten' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' },
	muscat: { name: 'Muskat' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const mangoldGorgonzola: Recipe = {
	id: 'c1008eceaa8ae55', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Mangold Gorgonzola Pasta',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRowAAABXRUJQVlA4IIAAAAAwAgCdASoPAAoAAUAmJYgCdAYtVuJvvpwEgAD8KddkeyvWX812cN32DyRDXkynl+1MSubaz/ZYTWNu+lB0ys9XFGkBqTgy9JsXzIwGI40ADYyQXIQ5EIVdb5nj3qmQDZ1c9dYjmN6NVPzx+QXHdOyEzHpU+lJw1PYAl7wt8/kAAA==',

	steps: [
		{
			description: 'Mangold waschen und in Streifen schneiden',
			linkedIngredients: [ingredients.mangold]
		},
		{
			description: 'Zwiebeln und Knoblauch schälen und fein hacken',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{
			description: 'Tomaten waschen und halbieren',
			linkedIngredients: [ingredients.tomato]
		},
		{
			description: 'Zwiebeln in einer Pfanne anbraten'
		},
		{
			description:
				'Mangold, Tomaten und Knoblauch hinzugeben, kurz mitbraten und mit Weißwein ablöschen',
			linkedIngredients: [ingredients.whiteWine]
		},
		{
			description: 'Gorgonzola hinzugeben und schmelzen lassen',
			linkedIngredients: [ingredients.gorgonzola]
		},
		{
			description: 'Mit Salz, Pfeffer und Muskat abschmecken',
			linkedIngredients: [ingredients.salt, ingredients.pepper, ingredients.muscat]
		},
		{
			description: 'Falls die Soße zu trocken ist, etwas Nudelwasser hinzugeben'
		},
		{
			description: 'Mit Nudeln servieren'
		}
	],
	ingredients: Object.values(ingredients)
};
