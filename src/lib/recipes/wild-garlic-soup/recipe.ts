import type { Recipe } from '../../../types';

const ingredients = {
	onion: { quantity: 2, name: 'Zwiebel' },
	butter: { quantity: 50, unit: 'g', name: 'Butter' },
	bayLeaf: { quantity: 2, name: 'Lorbeerblätter' },
	potatos: { quantity: 2, name: 'Kartoffeln' },
	wine: { quantity: 100, unit: 'ml', name: 'Weißwein' },
	stock: { name: 'Brühe', unit: 'ml', quantity: 500 },
	wildGarlic: { quantity: 50, unit: 'g', name: 'Bärlauch' },
	cream: { quantity: 100, unit: 'ml', name: 'Sahne' },
	lemon: { quantity: 0.5, name: 'Zitrone' },
	muscat: { name: 'Muskatnuss' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const wildGarlicSoup: Recipe = {
	id: '6c2a40def9f5197', // generated with "yarn get-random-id"
	meta: {
		portion: 3,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Bärlauchsuppe',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpAAAABXRUJQVlA4IIQAAACQAgCdASoPAAsAAUAmJbACdLoAEJUYGoQ53OM1AAD++a6bnEHyUmFGg/o+YaJg2UqCIXuHncdeEIVvAOfazISgZvfsf0Jp4bSh/LuBTfhgA7fxM0Od3mKTT6rTDdHEN7QhOl21eZdonJq/y37IFlDc2vEMnOwgcNBE9Q2F+4my9WQAAAA=',
	steps: [
		{
			description: 'Zwiebeln in Würfel schneiden.',
			linkedIngredients: [ingredients.onion]
		},
		{
			description: 'Kartoffeln schälen und in Würfel schneiden.',
			linkedIngredients: [ingredients.potatos]
		},
		{
			description: 'Bärlauch waschen und in Streifen schneiden.',
			linkedIngredients: [ingredients.wildGarlic]
		},
		{
			description: 'Ziebeln und Lorbeerblätter in einer Pfanne mit Butter glasig andünsten.',
			linkedIngredients: [ingredients.bayLeaf, ingredients.butter]
		},
		{
			description: 'Kartoffeln dazu geben und kurz andünsten.'
		},
		{ description: 'Mit Weißwein ablöschen.', linkedIngredients: [ingredients.wine] },

		{
			description: 'Mit Brühe aufgießen.',
			linkedIngredients: [ingredients.stock]
		},
		{
			description: 'Bärlauch dazu geben und köcheln lassen bis die Kartoffeln durch sind.'
		},
		{
			description: 'Sahne und Zitronensaft dazugeben. Und alles mit dem Pürierstab pürieren.',
			linkedIngredients: [ingredients.cream, ingredients.lemon]
		},
		{
			description: 'Mit Salz, Pfeffer und Muskat abschmecken.',
			linkedIngredients: [ingredients.salt, ingredients.pepper, ingredients.muscat]
		},
		{
			description: 'Mit selbstgeemachten Croutons servieren.'
		}
	],
	ingredients: Object.values(ingredients)
};
