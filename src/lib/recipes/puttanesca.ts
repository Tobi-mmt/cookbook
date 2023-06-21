import type { Recipe } from '../../types';

const ingredients = {
	oliveOil: { quantity: 50, unit: 'ml', name: 'Olivenöl' },
	garlic: { quantity: 6, unit: 'Zehen', name: 'Knoblauch' },
	chickpeas: { quantity: 400, unit: 'g', name: 'Kichererbsen (in der Dose)' },
	papirkaPowder: { quantity: 2, unit: 'TL', name: 'Paprikapulver' },
	cuminPowder: { quantity: 2, unit: 'TL', name: 'Kreuzkümmelpulver' },
	chili: { quantity: 2, unit: 'Prisen', name: 'Chilipulver' },
	tomatoPaste: { quantity: 1, unit: 'EL', name: 'Tomatenmark' },
	parsley: { quantity: 50, unit: 'g', name: 'Petersilie' },
	lemonPeel: { quantity: 2, unit: 'TL', name: 'abgeriebene Zitronenschale' },
	caper: { quantity: 3, unit: 'EL', name: 'Kapern' },
	olives: { quantity: 80, unit: 'g', name: 'Oliven' },
	cherryTomatoes: { quantity: 250, unit: 'g', name: 'Kirschtomaten' },
	sugar: { quantity: 2, unit: 'TL', name: 'Zucker' },
	kummel: { quantity: 1, unit: 'TL', name: 'Kümmel' },
	orecchiette: { quantity: 250, unit: 'g', name: 'Orecchiette' },
	stock: { quantity: 500, unit: 'ml', name: 'Gemüsebrühe' },
	water: { quantity: 200, unit: 'ml', name: 'Wasser' }
};

export const orecchiettePuttanesca: Recipe = {
	id: '3dce3daa69c965e', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Orecchiette Puttanesca',
	description:
		'Ein sehr leckers und einfaches Nudelgericht mit Kichererbsen, Tomaten und Oliven nach Art von Ottolenghi.',
	image: '/recipes/orecchiette-puttanesca.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRrQAAABXRUJQVlA4IKgAAADQAgCdASoPAAoAAUAmJbACdDiM95AIh8qwY4IulwNAAP5tIa9DchWjpgVU73Ff1/O26xplSV3LSdD3Du3Pv78VM/iGwjUcDAb5/qJH0ljyrQ1N0geVqvHVJpGypMEdqubtfkf31cLIBuHZqF3/JM1gysWxVkXJe+cxfeVOM94SS11dfslHJ2Gb/Bs13F/Pay3Jv25+Vt2yftrJoB2c/Y1n/GRa9AAAAAA=',
	steps: [
		{
			description:
				'Die ersten 7 Zutaten in eine Pfanne geben und 10 Minutan anbraten, bis die Kirchererbsen leicht knusprig sind.',
			linkedIngredients: [
				ingredients.oliveOil,
				ingredients.garlic,
				ingredients.chickpeas,
				ingredients.papirkaPowder,
				ingredients.cuminPowder,
				ingredients.chili,
				ingredients.tomatoPaste
			]
		},
		{
			description: 'Ein Drittel der Kirchererbsen herausnehmen und zur Seite stellen.'
		},
		{
			description:
				'Pertersilie, Zitronenschale, Kapern und Oliven in einer kleinen Schüssel vermischen. Zwei Drittel der Mischung in die Pfanne geben.',
			linkedIngredients: [
				ingredients.parsley,
				ingredients.lemonPeel,
				ingredients.caper,
				ingredients.olives
			]
		},
		{
			description: 'Kirschtomaten, Zucker und Kümmel in die Pfanne geben und 2 Minuten erhitzen.',
			linkedIngredients: [ingredients.cherryTomatoes, ingredients.sugar, ingredients.kummel]
		},
		{
			description:
				'Die Nudeln in die Pfanne geben, gefolgt von der Gemüsebrühe, etwas Salz und nach Bedarf Wasser.',
			linkedIngredients: [ingredients.orecchiette, ingredients.stock, ingredients.water]
		},
		{
			description:
				'Die Pfanne abdecken und 13 Minuten köcheln lassen, bis die Nudeln al dente sind.'
		},
		{
			description:
				'Den Rest der Petersilie- und der Kirchererbsenmischung unterrühren, mit Pfeffer verfeinern und servieren.'
		}
	],
	ingredients: Object.values(ingredients)
};
