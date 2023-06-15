import type { Recipe } from '../../types';

const ingredients = {
	bananas: { quantity: 180, unit: 'g', name: 'Bananen' },
	almondButter: { quantity: 70, unit: 'g', name: 'Mandelmus o. Erdnussbutter' },
	sugar: { quantity: 40, unit: 'g', name: 'Zucker' },
	oil: { quantity: 20, unit: 'g', name: 'Rapsöl' },
	oatFlour: { quantity: 120, unit: 'g', name: 'Hafermehl' },
	oatMilk: { quantity: 40, unit: 'ml', name: 'Hafermilch' },
	groundAlmonds: { quantity: 60, unit: 'g', name: 'gemahlene Mandeln' },
	bakingSoda: { quantity: 0.5, unit: 'TL', name: 'Natron' },
	bakingPowder: { quantity: 0.5, unit: 'TL', name: 'Backpulver' },
	salt: { quantity: 0.25, unit: 'TL', name: 'Meersalz' },
	vanilla: { quantity: 0.25, unit: 'TL', name: 'gemahlene Vanille' },
	cinnamon: { quantity: 0.25, unit: 'TL', name: 'Zimt' },
	chocolateDrops: { quantity: 40, unit: 'g', name: 'Schokodrops' }
};

export const bananaBlondies: Recipe = {
	id: '810574f4c02aba7', // generated with "yarn get-random-id"
	meta: {
		portion: 9,
		duration: 40,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Bananen Blondies',
	image: '/recipes/banana-blonies.webp',
	description:
		'Die Bananen Blondies sind super saftig und schmecken herrlich schokoladig. Sie sind schnell und einfach zubereitet und eignen sich perfekt als gesunder Snack für zwischendurch oder als Dessert.',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRqoAAABXRUJQVlA4IJ4AAACwAgCdASoPAAoAAUAmJaACdLoAEJiUrWzc6rv/NIAA/th+wlIO06LjVcpb3K1nCIoWfHFtJhiPzX3Mo+J/VvwGoPsPSAgHfe3eD74rNAcb631n9tziC1Jr5ur7S1J/et8u9+OBmLc3xjyycUnet08lz0DCwsO28ov/RLTaGrhG1dQzSzl7/liHA4ggVdfQ/xX4wMQGrjyyTnZUnEAAAA==',
	steps: [
		{
			description:
				'Den Backofen auf 180 Grad Ober- und Unterhitze vorheizen. Eine kleine Backform (ca. 20 x 20 cm) mit Backpapier auslegen.'
		},
		{
			description: 'Die Bananen mit einer Gabel zerdrücken.',
			linkedIngredients: [ingredients.bananas]
		},
		{
			description: 'Mandelmus, den Zucker und das Öl hinzufügen und alles gut verrühren.',
			linkedIngredients: [ingredients.almondButter, ingredients.sugar, ingredients.oil]
		},
		{
			description:
				'Hafermehl, die Hafermilch, die gemahlenen Mandeln, das Natron und das Backpulver hinzufügen und alles gut verrühren. So viel Milch verwenden, bis der Teig zwar noch etwas zäh aber streichfähig ist.',
			linkedIngredients: [
				ingredients.oatFlour,
				ingredients.oatMilk,
				ingredients.groundAlmonds,
				ingredients.bakingSoda,
				ingredients.bakingPowder
			]
		},
		{
			description:
				'Optional: Das Salz, die gemahlene Vanille und den Zimt hinzufügen und alles gut verrühren.',
			linkedIngredients: [ingredients.salt, ingredients.vanilla, ingredients.cinnamon]
		},
		{
			description:
				'Den Teig in die Backform geben und glatt streichen. Optional: Die Schokodrops auf dem Teig verteilen.',
			linkedIngredients: [ingredients.chocolateDrops]
		},
		{
			description:
				'Ca. 25 Minuten backen, dann aus dem Ofen nehmen und vollständig auskühlen lassen.'
		},
		{ description: 'Die Bananen Blondies in Stücke schneiden und servieren.' }
	],
	ingredients: Object.values(ingredients)
};
