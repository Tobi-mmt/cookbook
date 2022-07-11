import type { Recipe } from '../../types';

const ingredients = {
	section1: { section: 'Beize' },
	wine: { quantity: 700, unit: 'ml', name: 'trockener Rotwein' },
	vinegar: { quantity: 200, unit: 'ml', name: 'Rotweinessig' },
	mirepoix: { quantity: 1, unit: 'Bund', name: 'Suppengrün' },
	onion: { quantity: 2, name: 'Zwiebeln' },
	clove: { quantity: 4, name: 'Nelken' },
	bayLeaf: { quantity: 2, name: 'Lorbeerblätter' },
	juniperBerry: { quantity: 4, name: 'Wacholderbeeren' },
	pimento: { quantity: 2, name: 'Pimentkörner' },
	pepper: { quantity: 8, name: 'Pfefferkörner' },
	beef: { quantity: 1, unit: 'kg', name: 'Rinderschmorbraten' },
	section2: { section: 'Soße' },
	tomato: { quantity: 1, name: 'Tomate' },
	flour: { quantity: 2, unit: 'EL', name: 'Mehr' },
	raisin: { quantity: 50, unit: 'g', name: 'Rosinen' },
	pumpernickel: { quantity: 100, unit: 'g', name: 'Pumpernickel' },
	stock: { quantity: 1, unit: 'EL', name: 'Gemüsebrühe (Pulver)' }
};

export const sauerbraten: Recipe = {
	id: '6e6f6aac7a64ac9', // generated with "yarn get-random-id"
	meta: {
		portion: 8,
		duration: 180,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Sauerbraten',
	image: '/recipes/sauerbraten.webp',
	steps: [
		{ section: 'Die Beize' },
		{
			description: 'Rotwein und Essig mischen.',
			linkedIngredients: [ingredients.wine, ingredients.vinegar]
		},
		{
			description: 'Suppengrün putzen, waschen und zusammen mit den Zwiebeln klein schneiden.',
			linkedIngredients: [ingredients.mirepoix, ingredients.onion]
		},
		{
			description:
				'Pfefferkörner, Nelken, Wacholderbeeren und Pimentkörner im Mörser zerkleinern und in die Flüssigkeit geben.',
			linkedIngredients: [
				ingredients.pepper,
				ingredients.clove,
				ingredients.juniperBerry,
				ingredients.pimento
			]
		},
		{
			description:
				'Schmorbraten in die Flüssigkeit legen, Suppengrün und Lorbeerblätter dazu geben. Der Schmorbraten muss mit Flüssigkeit bedeckt sein, falls nicht, einfach etwas Wasser hinzugeben.',
			linkedIngredients: [ingredients.beef, ingredients.bayLeaf]
		},
		{
			description:
				'Das Ganze abdecken und 2–7 Tage kühl lagern. Je länger, desto zarter wird das Fleisch.'
		},
		{ section: 'Die Soße' },
		{
			description:
				'Das Fleisch aus der Beize nehmen, trocken tupfen, mit Salz einreiben und im Bräter rundherum anbraten.'
		},
		{
			description:
				'Nebenher die Beize durch ein Sieb geben, alles Feste wird zusammen mit Tomaten, Rosinen, Gemüsebrühpulver und dem Fleisch angebraten, die Flüssigkeit aufbewahren!',
			linkedIngredients: [ingredients.tomato, ingredients.raisin, ingredients.stock]
		},
		{
			description: 'Mit Butter und Mehl eine "Mehlschwitze" vorbereiten, in einem extra Topf.',
			linkedIngredients: [ingredients.flour]
		},
		{
			description:
				'Mehlschwitze mit der Beize ablöschen und alles zusammen in den Bräter zum Fleisch geben.'
		},
		{ description: 'Alles für 30 Minuten zugedeckt köcheln lassen.' },
		{
			description:
				'Pumpernickel zerbröckeln und weitere 90 Minuten im geschlossenen Topf köcheln lassen.',
			linkedIngredients: [ingredients.pumpernickel]
		},
		{ description: 'Fleisch heraus nehmen, in Scheiben schneiden und warm halten.' },
		{ description: 'Mit einem Pürierstab alles in der Soße zu einem Brei zerkleinern.' },
		{
			description:
				'Die Soße wird durch ein feines Sieb gegossen und das pürierte Gemüse so weit wie möglich durch das Sieb gedrückt.'
		},
		{ description: 'Fleisch wieder in die Soße geben oder extra anrichten.' },
		{ description: 'Dazu passen Spätzle und Blaukraut/Rotkraut.' }
	],
	ingredients: Object.values(ingredients)
};
