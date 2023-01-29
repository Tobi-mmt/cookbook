import type { Recipe } from '../../types';

const ingredients = {
	butter: { quantity: 250, unit: 'g', name: 'Butter' },
	sugar: { quantity: 250, unit: 'g', name: 'Zucker' },
	vanillaSugar: { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' },
	egg: { quantity: 2, name: 'Eier' },
	flour: { quantity: 450, unit: 'g', name: 'Mehl' },
	bakingPowder: { quantity: 1, unit: 'TL', name: 'Backpulver' }
};

export const spritzBiscuits: Recipe = {
	id: '6d2781ecd5f402d', // generated with "yarn get-random-id"
	meta: {
		portion: 50,
		duration: 60,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Spritzgebäck',
	image: '/recipes/butter-s.webp',
	// placeholderImage generated with "yarn get-placeholder-image PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRrAAAABXRUJQVlA4IKQAAACQAgCdASoPAAoAAUAmJYwCdEf/i1m+YMPuwVl4AAD+1iAetWXgLkWXvddvFz9LOLTa933PwoZgDHe5uPp3FRvYOVZCiA+MS6R6nR+jJQrNvR9kljR4Ufa5SHxCyzPb1vUfb6v0H4dBige/1+sKYF04kgY/9IgxnPMOkVvuCkIfhp2oRgf6puj2h6z917pymwHCm14rCMe3uXexR85BgN514gAAAA==',
	steps: [
		{ description: 'Backofen auf 180 °C Umluft vorheizen.' },
		{ description: 'Butter schaumig schlagen.', linkedIngredients: [ingredients.butter] },
		{
			description: 'Alle Zutaten in eine Schüssel geben und vermengen.',
			linkedIngredients: [
				ingredients.sugar,
				ingredients.vanillaSugar,
				ingredients.egg,
				ingredients.flour,
				ingredients.bakingPowder
			]
		},
		{ description: 'Wenn der Teig zu flüssig ist, mehr Mehl dazu geben.' },
		{
			description: 'Teig in Spritzbeutel geben und in gewünschter Form auf das Backpapier drücken.'
		},
		{ description: 'Backblech in Ofen geben und 15–20 Minuten backen lassen.' },
		{ description: 'Abkühlen lassen und optional ein Ende des Gebäcks in Schokolade tauchen.' }
	],
	ingredients: Object.values(ingredients)
};
