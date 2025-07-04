import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Teig' },
	flour: { quantity: 300, unit: 'g', name: 'Mehl' },
	bakingPowder: { quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },
	sugar: { quantity: 80, unit: 'g', name: 'Zucker' },
	egg: { quantity: 1, name: 'Ei' },
	margarine: { quantity: 50, unit: 'g', name: 'Margarine' },
	milk: { quantity: 1, unit: 'Spritzer', name: 'Milch' },
	section2: { section: 'Extras' },
	breadcrumb: { quantity: 1, unit: 'Hand voll', name: 'Semmelbrösel' },
	cineon: { name: 'Zimt' },

	section3: { section: 'Guss' },
	rhubarb: { quantity: 1, unit: 'kg', name: 'Rhabarber' },
	flour2: { quantity: 1, unit: 'EL', name: 'Mehl' },
	egg2: { quantity: 3, name: 'Eier' },
	vanillaSugar: { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' },
	cream: { quantity: 2, unit: 'Becher', name: 'Schmand' },
	sugar2: { quantity: 150, unit: 'g', name: 'Zucker' },
	whippingCream: { quantity: 1, unit: 'Becher', name: 'Schlagsahne' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const rhubarbPie: Recipe = {
	id: '0cbe988fb13f1ce', // generated with "yarn get-random-id"
	meta: {
		portion: 10,
		duration: 30,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Rhabarberkuchen',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpoAAABXRUJQVlA4II4AAACwAgCdASoPAAoAAUAmJbACdLoAEImUrUdFyKOntQAA/P/8dDmvOP/XS/SLidSB3yxWfop4UUpjRpWLz8LtPE7q0TJeAumk5Ta0PxrIstIaM6uPhKdE5YkMD2C3VHvarkbCzhpnmrfNCqvFN38v/Bgi9f+kCw86edanH2tiqeh0u8b1Bbk67cc78/lduAAA',
	steps: [
		{
			description:
				'Rhabarber schälen und in kleine Stücke schneiden. Mit etwa 4 Esslöffel Zucker vermischen und einziehen lassen.',
			linkedIngredients: [ingredients.rhubarb]
		},
		{ description: 'Backform mit etwas Butter einfetten.' },
		{
			description: 'Die Zutaten des Teiges in eine Schüssel geben und kräftig durchkneten.',
			linkedIngredients: [
				ingredients.flour,
				ingredients.bakingPowder,
				ingredients.sugar,
				ingredients.egg,
				ingredients.margarine,
				ingredients.milk
			]
		},
		{ description: 'Teig ausrollen und in die Form geben.' },
		{
			description: 'Teig mit Zimt bestreuen und die Semmelbrösel gleichmäßig verteilen.',
			linkedIngredients: [ingredients.cineon, ingredients.breadcrumb]
		},
		{
			description: 'Die Zutaten vom Guss – außer der Schlagsahne – in einer Schüssel anrühren.',
			linkedIngredients: [
				ingredients.flour2,
				ingredients.egg2,
				ingredients.vanillaSugar,
				ingredients.cream,
				ingredients.sugar2
			]
		},
		{
			description: 'Schlagsahne steif schlagen und ebenfalls in die Schüssel geben.',
			linkedIngredients: [ingredients.whippingCream]
		},
		{
			description:
				'Rhabarber in die Form mit dem Teig geben und den Guss darüber geben. Etwas Zimt darüber streuen.'
		},
		{
			description:
				'Den Kuchen nun auf der 2. Schiene von unten etwa 60 Minuten lang bei 160 °C Umluft backen lassen.'
		}
	],
	ingredients: Object.values(ingredients)
};
