import type { Recipe } from '../../../types';

const ingredients = {
	ginger: { quantity: 10, unit: 'g', name: 'Ingwer' },
	coriander: { quantity: 10, unit: 'g', name: 'Koriander' },
	onion: { quantity: 1, unit: '', name: 'Zwiebel' },
	chilli: { quantity: 0.5, unit: 'Schoten', name: 'Chili' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	halloumi: { quantity: 200, unit: 'g', name: 'Halloumi' },
	tomatoes: { quantity: 400, unit: 'g', name: 'Tomaten' },
	oil: { quantity: 4, unit: 'EL', name: 'Olivenöl' },
	peas: { quantity: 200, unit: 'g', name: 'Erbsen' },
	masala: { quantity: 1, unit: 'TL', name: 'Garam Masala' },
	cumin: { quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
	curcuma: { quantity: 1, unit: 'TL', name: 'Kurkuma' },
	salt: { name: 'Salz' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const halloumiCurry: Recipe = {
	id: '1f333d968583846', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Halloumi Curry',
	image: RecipeImage,
	description:
		'Ein leckeres und einfaches Halloumi Curry, das perfekt für ein schnelles Abendessen geeignet ist.',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpAAAABXRUJQVlA4IIQAAAAwAgCdASoPAAgAAUAmJZgCdAYsPqpNgzkHFAD+9aKG+88RtYhA6OKxMl5BEfZ4ALUzzITdNwwer+M9LP4uRvz9BTXkpyg/1aFGeVFtybM7XecxI59QN9VlvrrliZgUkU2sRK4ftyx4/pS5Hs9gaGaOqJn8eIrhbamVQ5/jbQCTrEvsgAA=',
	steps: [
		{
			description: 'Zwiebeln in halbe Ringe schneiden.',
			linkedIngredients: [ingredients.onion]
		},
		{
			description: 'Ingwer und Knoblauch fein hacken.',
			linkedIngredients: [ingredients.ginger, ingredients.garlic]
		},
		{
			description: 'Chili waschen, entkernen und fein hacken.',
			linkedIngredients: [ingredients.chilli]
		},
		{
			description: 'Zwiebeln mit Öl in einem Topf anschwitzen.',
			linkedIngredients: [ingredients.oil]
		},
		{
			description:
				'Ingwer, Knoblauch, Kreuzkümmel, Kurkuma, Garam Masala und Chili hinzufügen und kurz anschwitzen.',
			linkedIngredients: [ingredients.masala, ingredients.cumin, ingredients.curcuma]
		},
		{
			description: 'Gestückelte Tomaten hinzufügen und 5 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.tomatoes]
		},
		{
			description:
				'Erbsen in das Curry geben und weitere 5 Minuten köcheln lassen und mit Salz abschmecken.',
			linkedIngredients: [ingredients.peas, ingredients.salt]
		},
		{
			description: 'Halloumi in Würfel schneiden und in einer Pfanne anbraten.',
			linkedIngredients: [ingredients.halloumi]
		},
		{
			description: 'Koriander waschen, trocken schütteln und grob hacken.',
			linkedIngredients: [ingredients.coriander]
		},
		{
			description: 'Curry in einer Schüssel anrichten und mit Halloumi und Koriander garnieren.'
		}
	],
	ingredients: Object.values(ingredients)
};
