import type { Recipe } from '../../types';

const ingredients = {
	butter: { quantity: 250, unit: 'g', name: 'Butter' },
	sugar: { quantity: 200, unit: 'g', name: 'Zucker' },
	egg: { quantity: 4, name: 'Eier' },
	flour: { quantity: 250, unit: 'g', name: 'Mehl' },
	chocolate: { quantity: 150, unit: 'g', name: 'Schokostreusel' },
	vanillaSugar: { quantity: 3, unit: 'Pck.', name: 'Vanillezucker' },
	cinemon: { quantity: 1, unit: 'EL', name: 'Zimtpulver' },
	cacoa: { quantity: 1, unit: 'EL', name: 'Kakaopulver' },
	wine: { quantity: 125, unit: 'ml', name: 'Rotwein' },
	bakingPowder: { quantity: 1, unit: 'Pck.', name: 'Backpulver' }
};

export const redWinePie: Recipe = {
	id: 'a2da9168f15465a', // generated with "yarn get-random-id"
	meta: {
		portion: 7,
		duration: 70,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Rotweinkuchen',
	image: '/recipes/rotweinkuchen.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpQAAABXRUJQVlA4IIgAAAAQAgCdASoPAAoAAUAmJQBOgCG/T5aOY7rAAP7tEXz7TaXkvo1HKloD+WY7Mf8SX/r6WdeVngx9CYwSf09qVTHv4hTDDuMlgIkc6VGvQItJ25a3abjvKwPmooTDZk7NnP6Jn3ntEtF3+QKxjy3IXj9F0ovgfY3yn8p+y5HCyOX1/lCDKfk5AAAA',
	steps: [
		{ description: 'Backofen auf 180 °C Umluft vorheizen.' },
		{
			description:
				'In einer extra Schüssel die Eier schaumig aufschlagen. Unter Rühren Butter hinzugeben und danach den Zucker.',
			linkedIngredients: [ingredients.egg, ingredients.butter, ingredients.sugar]
		},
		{
			description:
				'Den Rest in einer extra Schüssel vermengen. Den Inhalt der ersten Schüssel unterheben.',
			linkedIngredients: [
				ingredients.flour,
				ingredients.chocolate,
				ingredients.vanillaSugar,
				ingredients.cinemon,
				ingredients.cacoa,
				ingredients.wine,
				ingredients.bakingPowder
			]
		},
		{ description: 'Backform mit etwas Butter einfetten und den Teig hineingeben.' },
		{ description: 'Die Form in den Ofen geben und 50–60 Minuten backen lassen.' }
	],
	ingredients: Object.values(ingredients)
};
