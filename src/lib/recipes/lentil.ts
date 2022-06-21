import type { Recipe } from '../../types';

const ingredients = {
	lentil: { quantity: 500, unit: 'g', name: 'Tellerlinsen' },
	onion: { quantity: 2, unit: 'große', name: 'Zwiebeln' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	flour: { quantity: 1, unit: 'EL', name: 'Mehl' },
	stock: { quantity: 1, unit: 'L', name: 'Gemüsebrühe' },
	mirepoix: { quantity: 400, unit: 'g', name: 'Suppengrün Bund' },
	tomatoPaste: { quantity: 1, unit: 'EL', name: 'Tomatenmark' },
	vinegar: { quantity: 1, unit: 'Spritzer', name: 'Balsamico & Weinessig' }
};

export const lentil: Recipe = {
	meta: {
		portion: 5,
		duration: 60,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Linsen',
	image: '/recipes/linsen.webp',
	steps: [
		{
			description: 'Die Linsen 12 Stunden in kaltem Wasser einweichen lassen.',
			linkedIngredients: [ingredients.lentil]
		},
		{
			description: 'Zwiebeln und Knoblauch in Margarine anbraten.',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{
			description:
				'Mehl hinzu geben, bis die Konsistenz breiig ist und eine goldgelbe Farbe angenommen hat.',
			linkedIngredients: [ingredients.flour]
		},
		{
			description: 'Mit Gemüsebrühe ablöschen und mit einem Rührbesen gut verrühren.',
			linkedIngredients: [ingredients.stock]
		},
		{
			description:
				'Linsen und Suppengrün am Stück hinzugeben und etwa 30 Minuten weich kochen lassen.',
			linkedIngredients: [ingredients.mirepoix]
		},
		{
			description:
				'Suppengrün heraus Sieben, im Mixer pürieren und wieder zurück in den Topf geben.'
		},
		{
			description:
				'Balsamico Essig und Weinessig 50/50 mischen und mit Tomatenmark in die Soße geben.',
			linkedIngredients: [ingredients.vinegar, ingredients.tomatoPaste]
		},
		{ description: 'Zusammen mit Spätzle servieren.' }
	],
	ingredients: Object.values(ingredients)
};
