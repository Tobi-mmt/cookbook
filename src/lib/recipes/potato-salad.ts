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
	id: 'dad8a5cc03bf3e2', // generated with "yarn get-random-id"
	meta: {
		portion: 6,
		duration: 20,
		category: 'Salat',
		nutritionType: 'Vegan'
	},
	title: 'Kartoffelsalat',
	image: '/recipes/kartoffelsalat.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpIAAABXRUJQVlA4IIYAAACwAgCdASoPAAoAAUAmJbACdLoAfheREhgr7TQDrygA/v3M3M5ZYDmY6SC2DVJBnEKuWeip18QJA75hmdTXXzyF9go2/LcVDWXalnrqo+pU3WwDxM8w4h7/9fIbp/Fi2+H/6gk8rPa5FaX1/9qgj/9sNgvr+6GeeG/DkvS46oVoc1GIqwAAAA==',

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
