import type { Recipe } from '../../types';

const ingredients = {
	pig: { quantity: 350, unit: 'g', name: 'Schweinefilet' },
	vegi: { quantity: 250, unit: 'g', name: 'Buttergemüse' },
	bacon: { quantity: 1, unit: 'Pck.', name: 'Speck' },
	stock: { quantity: 100, unit: 'ml', name: 'Brühe' },
	creme: { quantity: 0.5, unit: 'Flasche', name: 'Cremefine' },
	cheese: { quantity: 1, unit: 'EL', name: 'Frischkäse' },
	pepper: { quantity: 1, unit: 'TL', name: 'Pfefferkörner, eingelegt' },
	butter: { quantity: 1, unit: 'EL', name: 'Butter' }
};

export const pepperMedaillon: Recipe = {
	id: '6cf38a4ae10cb73', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Medaillons in Pfefferrahmsoße',
	image: '/recipes/schweinemedaillons.webp',
	// placeholderImage generated with "yarn get-placeholder-image PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRooAAABXRUJQVlA4IH4AAACQAgCdASoPAAoAAUAmJbACdDBKyIfMrtlvNH25AAD+wqPTsovbPi9cWfHUppuIPWbAysbbBM7/8175aa8wRgiVYuYmQP47h5UKFUas/h+dMpED/TXHPPeG//GKpfip/ilQN3/s23L/+DWaOPpKOHQrxvrFG+vx/f2FtAPwAAA=',

	steps: [
		{
			description: 'Buttergemüse in einen Topf geben und bei geringer Hitze auftauen lassen.',
			linkedIngredients: [ingredients.vegi]
		},
		{
			description:
				'Filet waschen, trocken tupfen und in gleichmäßige Scheiben schneiden, mit Salz und Pfeffer würzen und mit Bacon umwickeln.',
			linkedIngredients: [ingredients.pig, ingredients.bacon]
		},
		{
			description:
				'Filet in einer Pfanne mit heißem Öl von allen Seiten scharf anbraten, sodass das Fleisch medium wird.'
		},
		{
			description:
				'Gemüsebrühpulver in heißes Wasser rühren und zum Fleisch geben, zusammen mit Cremefine, Frischkäse und Pfefferkörner.',
			linkedIngredients: [
				ingredients.stock,
				ingredients.creme,
				ingredients.cheese,
				ingredients.pepper
			]
		},
		{ description: 'Nach etwa 7 Minuten einkochen ist alles fertig.' },
		{ description: 'Dazu passen gut Nudeln oder Kroketten.' }
	],
	ingredients: Object.values(ingredients)
};
