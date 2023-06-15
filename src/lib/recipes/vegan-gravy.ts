import type { Recipe } from '../../types';

const ingredients = {
	onion: { quantity: 1, name: 'rote Zwiebel' },
	mushroom: { quantity: 150, unit: 'g', name: 'Champignons' },
	carrot: { quantity: 1, name: 'Karotte' },
	oil: { quantity: 2, unit: 'EL', name: 'Rapsöl' },
	butter: { quantity: 1, unit: 'EL', name: 'Margarine' },
	tomato: { quantity: 2, unit: 'EL', name: 'Tomatenmark' },
	flour: { quantity: 1, unit: 'EL', name: 'Mehl' },
	sugar: { quantity: 2, unit: 'TL', name: 'brauner Zucker' },
	wine: { quantity: 50, unit: 'ml', name: 'Rotwein' },
	stock: { quantity: 400, unit: 'ml', name: 'Gemüsebrühe' },
	soy: { quantity: 1, unit: 'EL', name: 'Sojasauce' },
	bayLeaf: { quantity: 1, name: 'Lorbeerblatt' },
	juniperBerry: { quantity: 5, name: 'Wacholderbeeren' },
	thyme: { quantity: 1, unit: 'TL', name: 'Thymian' },
	mustard: { quantity: 2, unit: 'TL', name: 'Senf' },
	salt: { quantity: 0.5, unit: 'TL', name: 'Salz' },
	pepper: { quantity: 1, unit: 'Prise', name: 'Pfeffer' }
};

export const veganGravy: Recipe = {
	id: 'a933602f061a674', // generated with "yarn get-random-id"
	meta: {
		portion: 5,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Vegane Bratensoße',
	image: '/recipes/bratensosse.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRogAAABXRUJQVlA4IHwAAAAwAgCdASoPAAoAAUAmJZgCdAYt9adlxp0X4AD+8H3LfFjj9woqGFd/09lPfABdbjRM5CN+RrNt44WGjf2ReiG5QSBb2cnQoPVehA4B7qTgtQyND1Biw4t0hKyAO4UPP91y7EEPkhqGK+yGt+L1HZ55PWSAP2ff5AJ6WAAA',
	steps: [
		{
			description:
				'Zwiebel, Karotte und Champignons würfeln und in einem Topf mit Öl scharf anbraten, bis es braun wird.',
			linkedIngredients: [
				ingredients.onion,
				ingredients.carrot,
				ingredients.mushroom,
				ingredients.oil
			]
		},
		{
			description: 'Margarine, Tomatenmark, Mehl und braunen Zucker dazugeben.',
			linkedIngredients: [
				ingredients.butter,
				ingredients.tomato,
				ingredients.flour,
				ingredients.sugar
			]
		},
		{
			description: 'Mit Rotwein, Gemüsebrühe und Sojasoße ablöschen.',
			linkedIngredients: [ingredients.wine, ingredients.stock, ingredients.soy]
		},
		{
			description: 'Rest unterrühren und 10 min bei niedriger Hitze köcheln lassen.',
			linkedIngredients: [
				ingredients.bayLeaf,
				ingredients.juniperBerry,
				ingredients.thyme,
				ingredients.mustard,
				ingredients.salt,
				ingredients.pepper
			]
		},
		{
			description:
				'Zum Schluss entweder die Soße durch ein feines Sieb passieren (ca. 400ml) oder Lorbeerblatt und Wacholderbeeren entfernen und den Rest mit einem Mixer pürieren (ca. 600ml)'
		}
	],
	ingredients: Object.values(ingredients)
};
