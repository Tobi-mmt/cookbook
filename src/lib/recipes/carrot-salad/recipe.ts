import type { Recipe } from '../../../types';

const ingredients = {
	carrot: { quantity: 1, unit: 'kg', name: 'Karotten' },
	oil: { quantity: 3, unit: 'EL', name: 'Sonnenblumenöl' },
	balsamicVinegar: { quantity: 1, unit: 'EL', name: 'Balsamicoessig' },
	wineVinegar: { quantity: 1, unit: 'EL', name: 'Weinessig' },
	lemon: { quantity: 0.5, name: 'Zitrone' },
	water: { quantity: 1, unit: 'kleine Tasse', name: 'Wasser' },
	sugar: { quantity: 1, unit: 'TL', name: 'Zucker' },
	lovage: { quantity: 0.5, unit: 'TL', name: 'Liebstöckel gemahlen' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' },
	cream: { quantity: 1, unit: 'Becher', name: 'saure Sahne' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const carrotSalad: Recipe = {
	id: 'c36ffe8815a8fbc', // generated with "yarn get-random-id"
	meta: {
		portion: 7,
		duration: 40,
		category: 'Salat',
		nutritionType: 'Vegetarisch'
	},
	title: 'Karottensalat',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqwAAABXRUJQVlA4IKAAAACQAgCdASoPAAsAAUAmJbACdLoAEJOUJ+BGP+arQAD+4MfmsR313WaSuhJkvqsa5b3AaOPj/66zA5uSbVuLnsgxquJ0vtB+o5eafyrsYPEQsf8cRKscrebyQQPMy5nOkbX9zeaWLFa2AHtid6ZA5aQXBJsaf/87k/L4avLiCSpteXSvgUA6rI4f/PfXQmPArGpG+CTfFR8d3Q6TCmVIAAAA',
	steps: [
		{
			description:
				'Karotten waschen, schälen und in sehr feine Stifte schneiden. Am besten mit einer Küchenmaschine oder einer Reibe.',
			linkedIngredients: [ingredients.carrot]
		},
		{
			description: 'Zitrone auspressen und den Saft mit den Karotten in eine Schüssel geben.',
			linkedIngredients: [ingredients.lemon]
		},
		{
			description: 'Alle Zutaten bis auf die Sahne in die Schüssel geben und gut durchmischen.',
			linkedIngredients: [
				ingredients.oil,
				ingredients.balsamicVinegar,
				ingredients.wineVinegar,
				ingredients.water,
				ingredients.sugar,
				ingredients.lovage,
				ingredients.salt,
				ingredients.pepper
			]
		},
		{ description: 'Mindestens 4h, am besten jedoch über Nacht durchziehen lassen.' },
		{
			description: 'Danach Sahne hinzugeben, kräftig durchmischen und servieren.',
			linkedIngredients: [ingredients.cream]
		}
	],
	ingredients: Object.values(ingredients)
};
