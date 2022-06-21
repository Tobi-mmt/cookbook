import type { Recipe } from '../../types';

const ingredients = {
	fennel: { quantity: 1, name: 'Fenchel' },
	onion: { quantity: 1, name: 'Zwiebel' },
	springOnion: { quantity: 0.5, name: 'Frühlingszwiebel' },
	lemon: { quantity: 0.5, name: 'Zitrone' },
	mushroom: { quantity: 150, unit: 'g', name: 'Champignons' },
	parmesan: { quantity: 40, unit: 'g', name: 'Parmesan' },
	rice: { quantity: 150, unit: 'g', name: 'Risottoreis' },
	wine: { quantity: 150, unit: 'ml', name: 'Weißwein' },
	butter: { quantity: 2, unit: 'EL', name: 'Butter' },
	garlic: { quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
	sugar: { quantity: 1, unit: 'TL', name: 'Rohrzucker' },
	chili: { quantity: 1, unit: 'TL', name: 'Chiliflocken' },
	stock: { quantity: 500, unit: 'ml', name: 'Gemüsebrühe' }
};

export const fennelRisotto: Recipe = {
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Risotto mit Fenchel und Champignons',
	image: '/recipes/fennel-risotto.webp',
	steps: [
		{
			description: 'Knoblauch und Zwiebel schälen und würfeln.',
			linkedIngredients: [ingredients.garlic, ingredients.onion]
		},
		{ description: 'Beides in einem Topf mit etwas Öl anschwitzen.' },
		{
			description: 'Risottoreis hinzugeben und 2 Minuten glasig braten.',
			linkedIngredients: [ingredients.rice]
		},
		{
			description:
				'Wein hinzugeben und köcheln lassen bis die Flüssigkeit vollständig aufgesogen ist.',
			linkedIngredients: [ingredients.wine]
		},
		{
			description: 'Brühe hinzugeben und etwa 15 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.stock]
		},
		{ description: 'Fenchel waschen und grob würfeln.', linkedIngredients: [ingredients.fennel] },
		{ description: 'Fenchel mit etwas Öl in einer Pfanne goldbraun braten.' },
		{
			description: 'Zucker hinzugeben und alles 3 Minuten in der Pfanne schwenken.',
			linkedIngredients: [ingredients.sugar]
		},
		{ description: 'Zitrone auspressen.', linkedIngredients: [ingredients.lemon] },
		{ description: 'Parmesan reiben.', linkedIngredients: [ingredients.parmesan] },
		{
			description: 'Fenchel, Butter, Zitronensaft und Parmesan zum Reis dazugeben und Mischen.',
			linkedIngredients: [ingredients.butter]
		},
		{
			description: 'Mit Chiliflocken, Salz und Pfeffer abschmecken und zur Seite stellen.',
			linkedIngredients: [ingredients.chili]
		},
		{ description: 'Pilze waschen und grob würfeln.', linkedIngredients: [ingredients.mushroom] },
		{ description: 'Pilze in einer Pfanne mit etwas Öl scharf anbraten.' },
		{
			description: 'Frühlingszwiebeln waschen und in Ringe schneiden.',
			linkedIngredients: [ingredients.springOnion]
		},
		{ description: 'Risotto in einen Teller geben und mit Pilzen und Frühlingszwiebeln garnieren.' }
	],
	ingredients: Object.values(ingredients)
};
