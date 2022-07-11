import type { Recipe } from '../../types';

const ingredients = {
	dill: { quantity: 10, unit: 'g', name: 'Dill' },
	onion: { quantity: 1, name: 'Zwiebel' },
	lemon: { quantity: 0.5, name: 'Zitrone' },
	tomatos: { quantity: 100, unit: 'g', name: 'Tomaten' },
	bean: { quantity: 400, unit: 'g', name: 'weiße Bohnen aus der Dose' },
	butter: { quantity: 2, unit: 'EL', name: 'Butter' },
	curcuma: { quantity: 0.5, unit: 'TL', name: 'Kurkuma' },
	sugar: { quantity: 1, unit: 'TL', name: 'Zucker' },
	garlic: { quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
	water: { quantity: 160, unit: 'ml', name: 'Wasser' },
	cumin: { quantity: 0.5, unit: 'TL', name: 'Kreuzkümmel' },
	egg: { quantity: 4, name: 'Eier' }
};

export const persianBeans: Recipe = {
	id: '2115eaceef5309b', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Persische Bohnenpfanne',
	image: '/recipes/persian-beans.webp',
	steps: [
		{
			description: 'Bohnen spülen und im Sieb abtropfen lassen.',
			linkedIngredients: [ingredients.bean]
		},
		{
			description: 'Zwiebel schälen und in Halbringe schneiden.',
			linkedIngredients: [ingredients.onion]
		},
		{ description: 'Knoblauch schälen und würfeln.', linkedIngredients: [ingredients.garlic] },
		{ description: 'Dill waschen und fein hacken.', linkedIngredients: [ingredients.dill] },
		{
			description: 'Zitrone waschen und Schale abreiben. Danach Zitrone auspressen.',
			linkedIngredients: [ingredients.lemon]
		},
		{
			description: 'Zwiebelringe in der Pfanne mit Butter kurz anbraten.',
			linkedIngredients: [ingredients.butter]
		},
		{
			description: 'Kurkuma und Knoblauch dazu geben und dünsten lassen.',
			linkedIngredients: [ingredients.curcuma]
		},
		{
			description:
				'Bohnen, Kreuzkümmel, Wasser, Zucker und Zitronensaft hinzugeben und mit Salz und Pfeffer abschmecken.',
			linkedIngredients: [ingredients.cumin, ingredients.water, ingredients.sugar]
		},
		{
			description: 'Tomaten, Zitronenschale und Dill hinzugeben und köcheln lassen.',
			linkedIngredients: [ingredients.tomatos, ingredients.dill]
		},
		{
			description: 'Kleine Mulden in den Bohnen drücken und dort die Eier hineinschlagen.',
			linkedIngredients: [ingredients.egg]
		},
		{ description: '4 Minuten mit Deckel köcheln lassen.' },
		{ description: 'Mit Fladenbrot servieren.' }
	],
	ingredients: Object.values(ingredients)
};
