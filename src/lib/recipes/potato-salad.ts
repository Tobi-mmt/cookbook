import type { Recipe } from '../../types';

const ingredients = {
	potato: { name: 'Kartoffeln, festkochend', quantity: 2, unit: 'kg' },
	onion: { name: 'Zwiebel', quantity: 1 },
	stock: { name: 'Brühe', quantity: 200, unit: 'ml' },
	vinegar: { name: 'Essig', quantity: 50, unit: 'ml' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' },
	oil: { name: 'Öl', quantity: 2, unit: 'Schuss' }
};

export const potatoSalad: Recipe = {
	meta: {
		portion: 6,
		duration: 20,
		category: 'Salat',
		nutritionType: 'Vegan'
	},
	title: 'Kartoffelsalat',
	image: '/recipes/kartoffelsalat.webp',
	steps: [
		{
			description: 'Die Kartoffeln schälen und kochen, bis sie durch sind.',
			linkedIngredients: [ingredients.potato]
		},
		{ description: 'Kartoffeln in Scheiben schneiden und in eine Schüssel geben.' },
		{
			description: 'Die heiße Brühe über die Kartoffeln schütten.',
			linkedIngredients: [ingredients.stock]
		},
		{
			description:
				'Eine Zwiebel in kleine Würfel schneiden und zusammen mit Salz, Pfeffer, Essig, Öl in die Schüssel geben und alles gut durchmischen.',
			linkedIngredients: [
				ingredients.onion,
				ingredients.salt,
				ingredients.pepper,
				ingredients.vinegar,
				ingredients.oil
			]
		},
		{
			description:
				'Nun wird so lange heißes Wasser hinzugegeben, bis der Kartoffelsalat „nass“ aber NICHT suppenartig ist.'
		},
		{ description: 'Den fertigen Salat warm servieren – schmeckt auch kalt sehr gut.' }
	],
	ingredients: Object.values(ingredients)
};
