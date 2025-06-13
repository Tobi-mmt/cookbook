import type { Recipe } from '../../../types';

const ingredients = {
	potato: { quantity: 4, name: 'große Kartoffeln' },
	zucchini: { quantity: 1, name: 'Zucchini' },
	carrot: { quantity: 5, name: 'Karotten' },
	onion: { quantity: 1, name: 'große Zwiebel' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	cheese: { quantity: 200, unit: 'g', name: 'Schafskäse' },
	wine: { quantity: 3, unit: 'EL', name: 'Rotwein' },
	vinegar: { quantity: 3, unit: 'EL', name: 'Essig' },
	orange: { quantity: 3, unit: 'EL', name: 'Orangensaft' },
	oil: { name: 'Rapsöl' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const stoveSegetables: Recipe = {
	id: '8919f04870dcb2c', // generated with "yarn get-random-id"
	meta: {
		portion: 3,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Ofengemüse in Rotweinmarinade',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRsQAAABXRUJQVlA4ILgAAADwAgCdASoPAAoAAUAmJbACdLoAfiq3Zqr4aat+TzrizAD+5qnv74/k2sUp0b18IypNv+k7nS4KlqZWPLDJf/m4+BaM2SJmyr/9Fw4AWa5s9bLNcU0yoPQOWgP+P8MYgieQVgUvr7MuypFemW9nEsvq6vYDeM8xJWWbSC2MUYupmh1VPdsMut9ulJfOW8kIwziQbv91/lh1EVQN+sdiKrTNZWwik/2rPH+oyNz2+8wfdV9F3bqC6AAA',
	steps: [
		{ description: 'Gemüse waschen und schälen.' },
		{
			description:
				'Gemüse in sehr dünne Scheiben schneiden. Am besten man kann durch die Scheiben fast hindurch sehen.',
			linkedIngredients: [
				ingredients.potato,
				ingredients.zucchini,
				ingredients.carrot,
				ingredients.onion,
				ingredients.garlic
			]
		},
		{
			description:
				'Zusammen mit den Flüssigkeiten und den Gewürzen in eine große Schüssel geben und gut durchmischen. Mit Salz und Peffer abschmecken.',
			linkedIngredients: [
				ingredients.oil,
				ingredients.wine,
				ingredients.vinegar,
				ingredients.orange
			]
		},
		{
			description: 'Alles in eine Backform geben und den Käse darüber verteilen.',
			linkedIngredients: [ingredients.cheese]
		},
		{ description: 'Bei 225 °C Ober-Unterhitze für 30 Minuten backen.' },
		{ description: 'Mit frischem Baguette oder Brot servieren.' }
	],
	ingredients: Object.values(ingredients)
};
