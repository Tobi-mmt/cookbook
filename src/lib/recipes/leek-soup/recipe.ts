import type { Recipe } from '../../../types';

const ingredients = {
	onion: { name: 'Zwiebeln', quantity: 2 },
	garlic: { name: 'Knoblauchzehen', quantity: 2 },
	leek: { name: 'Porree', quantity: 500, unit: 'g' },
	mincedMeat: { name: 'vegi Hack', quantity: 1000, unit: 'g' },
	sunflowerOil: { name: 'Sonnenblumenöl', quantity: 4, unit: 'EL' },
	salt: { name: 'Salz' },
	vegetableStock: { name: 'Gemüsebrühe', quantity: 1600, unit: 'ml' },
	creamCheese: { name: 'Schmelzkäse (Rahmstufe)', quantity: 400, unit: 'g' },
	cremeFraiche: { name: 'Crème fraîche (30 % Fett)', quantity: 300, unit: 'g' },
	cayennePepper: { name: 'Cayennepfeffer', quantity: 2, unit: 'Prisen' },
	nutmeg: { name: 'geriebene Muskatnuss', quantity: 2, unit: 'Prisen' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const leekSoup: Recipe = {
	id: '0b57e94daf130eb', // generated with "yarn get-random-id"
	meta: {
		portion: 8,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Lauchsuppe',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRrwAAABXRUJQVlA4ILAAAACwAgCdASoPAAoAAUAmJbACdLoAEI8WKHGfEowyeAAA/uvG3dj+f0xZfCMa31jAW+PR3/rM7M19KugGH4KXWn6OjCkcE+owAwSimOj3g7PuYmaoK1+ksdXN1hFq2QnG/Zm5fDOxXoj/2hzfA9WFst2mGb0X+q6vd82+lVGhusJx6gO5FF+1ZGC6veu0YScRBGBjmVoXj5N3QxYeDoDGxn9GGd/9hA1l2EHVrtPcb8AAAA==',

	steps: [
		{
			description: 'Zwiebeln und Knoblauch schälen und fein würfeln.',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{
			description: 'Porree putzen, waschen und in Halbringe schneiden.',
			linkedIngredients: [ingredients.leek]
		},
		{
			description:
				'Sonnenblumenöl in einem großen Topf erhitzen und das vegi Hack darin anbraten, zusammen mit Zwiebeln und Knoblauch.',
			linkedIngredients: [ingredients.mincedMeat, ingredients.sunflowerOil]
		},
		{
			description: 'Porree zugeben und kurz mitbraten.',
			linkedIngredients: [ingredients.leek]
		},
		{
			description: 'Gemüsebrühe hinzugeben und 10 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.vegetableStock]
		},
		{
			description:
				'Schmelzkäse und Crème fraîche einrühren und mit Cayennepfeffer, Muskatnuss und Salz abschmecken.',
			linkedIngredients: [
				ingredients.creamCheese,
				ingredients.cremeFraiche,
				ingredients.cayennePepper,
				ingredients.nutmeg,
				ingredients.salt
			]
		},
		{
			description: 'Mit frischem Brot servieren.'
		}
	],
	ingredients: Object.values(ingredients)
};
