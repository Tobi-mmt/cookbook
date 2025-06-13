import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Füllung' },
	spinach: { quantity: 250, unit: 'g', name: 'frischer Blattspinat' },
	onion: { quantity: 2, name: 'Zwiebeln' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	mushrooms: { quantity: 150, unit: 'g', name: 'Riesenchampignons' },

	section2: { section: 'Soße' },
	paprika: { quantity: 400, unit: 'g', name: 'Paprika' },
	tomato: { quantity: 50, unit: 'g', name: 'getrocknete Tomaten' },
	thyme: { quantity: 4, unit: 'TL', name: 'Thymian' },
	lemon: { quantity: 1, unit: 'TL', name: 'Zitronensaft' },
	cream: { quantity: 150, unit: 'ml', name: 'vagane Sahne' },
	stock: { quantity: 150, unit: 'ml', name: 'Gemüsebrühe' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const mushroomPan: Recipe = {
	id: '73dfd163f27192a', // generated with "yarn get-random-id"
	meta: {
		portion: 4,
		duration: 60,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Pilzschmorpfanne',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRrQAAABXRUJQVlA4IKgAAABwAgCdASoPAAoAAUAmJZgCdAYuHqiqUNj5dvQAAP7tK4lXiZNoegcroWqV2X8uq/VypskWGMPoaeMFl1V/+u0wDF+oNH+eGWmi1dxhoHH1CHvZKaBEP8dOwn6ejwSj4sFiEj+2YmPMhfp38CpaSr/Z0A2vfjhmoV3V1bo7/1ixfJU3iZ+31xv8LoDfkgQ8qpofM5Rxb+VXr+At2bcbrOosV3Y+qdkAAAA=',

	steps: [
		{
			description: 'Spinat waschen und zusammen mit Zwiebeln und Knoblauch fein würfeln.',
			linkedIngredients: [ingredients.spinach, ingredients.onion, ingredients.garlic]
		},
		{
			description: 'Stiele aus den Champignons entfernen und diese fein hacken.',
			linkedIngredients: [ingredients.mushrooms]
		},
		{
			description:
				'Pilzstiele, Knoblauch und Hälfte der Zwiebeln darin andünsten. Den Spinat nach und nach zugeben.'
		},
		{ description: 'Pilze mit Spinat-Mischung füllen.' },
		{
			description:
				'Paprika und Tomaten grob schneiden und zusammen mit dem Rest der Zwiebel in Pfanne leicht anbraten.',
			linkedIngredients: [ingredients.paprika, ingredients.tomato]
		},
		{
			description:
				'Mit Gemüsebrühe ablöschen, Sahne, Zitronensaft und Thymian hinzugeben und mit Salz & Pfeffer würzen.',
			linkedIngredients: [
				ingredients.stock,
				ingredients.cream,
				ingredients.lemon,
				ingredients.thyme
			]
		},
		{
			description:
				'Pilze in die Pfanne setzen und auf geringer Temperatur etwa 20 Minuten köcheln lassen.'
		},
		{ description: 'Mit Salzkartoffeln oder Kartoffelpüree servieren.' }
	],
	ingredients: Object.values(ingredients)
};
