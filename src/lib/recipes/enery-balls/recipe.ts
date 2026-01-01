import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Teig' },
	almond: { quantity: 50, unit: 'g', name: 'gehackte Mandeln' },
	coconut: { quantity: 30, unit: 'g', name: 'Kokosraspeln' },
	apricot: { quantity: 100, unit: 'g', name: 'Aprikosen' },
	dates: { quantity: 100, unit: 'g', name: 'Datteln' },
	oat: { quantity: 25, unit: 'g', name: 'Haferflocken' },
	agave: { quantity: 10, unit: 'g', name: 'Agavendicksaft' },
	coconutoil: { quantity: 20, unit: 'g', name: 'Kokosöl' },
	section2: { section: 'Zum Bestreuen' },
	coconut2: { quantity: 100, unit: 'g', name: 'Kokosraspeln' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const energyBalls: Recipe = {
	id: '8042e928b7ce5d2', // generated with "yarn get-random-id"
	meta: {
		portion: 20,
		duration: 60,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Energie-Kugeln',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRt4AAABXRUJQVlA4INIAAABQBACdASoPABQAPm0qkUWkIqGYBABABsSgCdMoRwAc+AolAJT7u08AbTgAAP73njhT8mvm5fcYBq/j5G25Krfyku2i4UV7/HxCrPKwv6rovacOVHzHsWJlL4rsHk56lPG0Y2FN3/nP+xO8DjZzyfE7stk14r/qY5PiHuybdoeSe7yspwKwmTfmviWGb3ekj72Yn7CMJrs98ogbgwyy+SJ79ZrkfmOndfuTpie8A8fQT/mhQ8aiGbllvp/+qTvpmCzYAdKW/Faudk9CXSmCZcNAAAA=',
	steps: [
		{
			description: 'Alle Zutaten für den Teig in eine Schüssel geben und vermengen.',
			linkedIngredients: [
				ingredients.almond,
				ingredients.coconut,
				ingredients.apricot,
				ingredients.dates,
				ingredients.oat,
				ingredients.agave,
				ingredients.coconutoil
			]
		},
		{ description: 'Teig zu kleinen Kugeln formen.' },
		{
			description:
				'Zum Bestreuen: Kokosraspeln in eine Schüssel geben und die Kugeln darin wenden.',
			linkedIngredients: [ingredients.coconut2]
		}
	],
	ingredients: Object.values(ingredients)
};
