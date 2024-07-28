import type { Recipe } from '../../types';

const ingredients = {
	section11: { section: 'Füllung' },
	spinach: { quantity: 300, unit: 'g', name: 'Spinat' },
	cheese: { quantity: 4, unit: 'EL', name: 'Cheddarkäse, gerieben' },
	feta: { quantity: 150, unit: 'g', name: 'Feta-Käse' },
	onion: { quantity: 1, name: 'Zwiebel' },
	egg: { quantity: 1, name: 'Ei' },
	section2: { section: 'Teig' },
	flakyPastry: { quantity: 1, unit: 'Pck.', name: 'Blätterteig' },
	egg2: { quantity: 1, name: 'Ei' }
};

export const spinatFeta: Recipe = {
	id: '967ac074bbc3d06', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Blätterteig mit Spinat & Feta',
	image: '/recipes/blaetterteig_mit_spinat.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqwAAABXRUJQVlA4IKAAAABwAgCdASoPAAoAAUAmJagCdAYtf2444+cl0PAAAP76PB+xe+W2DVXo113uhAhL1DP3+jb+Fk35a9h19+6dlM6ed/mS9tiARk/k+TmCKf+o7LlpZRpmniWjHBLW2iwoAakC9/h78syLexJmPjpvHenZrruaWtgMOu8/JuSUZyf6ZRb+HHI89msCCks/CYGix6BYkUgSc6rKGfVp163hQAAA',
	steps: [
		{ description: 'Den Ofen auf 175 °C bei Umluft vorheizen.' },
		{
			description: 'Öl im Topf erhitzen, die Zwiebel hinzugeben und glasig braten.',
			linkedIngredients: [ingredients.onion]
		},
		{
			description:
				'Spinat dazugeben und einige Momente lang dünsten. Sofern der Spinat zu viel Flüssigkeit ablässt, diese abgießen.',
			linkedIngredients: [ingredients.spinach]
		},
		{
			description: 'Feta, Käse und ein verquirltes Ei hinzufügen und alles gut vermischen.',
			linkedIngredients: [ingredients.feta, ingredients.cheese, ingredients.egg]
		},
		{
			description: 'Den Blätterteig ausrollen und in Quadrate schneiden, etwa 10 x 10 cm groß.',
			linkedIngredients: [ingredients.flakyPastry]
		},
		{
			description:
				'Spinatmischung auf die Quadrate geben, zu Dreiecken zusammenklappen, mit einem verquirlten Ei bestreichen und ab in den Ofen.',
			linkedIngredients: [ingredients.egg2]
		},
		{ description: 'Etwa 20 Minuten backen, bzw. bis die Dreiecke goldgelb sind.' }
	],
	ingredients: Object.values(ingredients)
};
