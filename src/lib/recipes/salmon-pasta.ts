import type { Recipe } from '../../types';

const ingredients = {
	onion: { quantity: 1, name: 'Zwiebel' },
	lemon: { quantity: 0.5, name: 'Zitrone' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	spinach: { quantity: 450, unit: 'g', name: 'Spinat (TK)' },
	salmon: { quantity: 200, unit: 'g', name: 'Lachs' },
	wine: { quantity: 100, unit: 'ml', name: 'Weißwein' },
	cream: { quantity: 100, unit: 'ml', name: 'Sahne' },
	parmesan: { quantity: 100, unit: 'g', name: 'Parmesan' },
	cheeese: { quantity: 200, unit: 'g', name: 'Schmelzkäse' },
	stock: { name: 'Brühe (Pulver)' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' }
};

export const salmonPasta: Recipe = {
	id: 'fffbe78941911d4', // generated with "yarn get-random-id"
	meta: {
		portion: 5,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Fleisch'
	},
	title: 'Lachsnudeln',
	image: '/recipes/lachsnudeln.webp',
	// placeholderImage generated with "yarn get-placeholder-image PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpwAAABXRUJQVlA4IJAAAAAwAgCdASoPAAoAAUAmJYgCdAYtVyGtjsZ8aAD+4p1CLv6AHzdtgI7qr4JS13Zz56YFBtBXsDawkPo1o97irxsi8QpiqJ0UUwFogPFAo75/Eo/R3XU2x1cC00wCtQ3/COU57q31prThgit99y/SjPlK94f/BG7ocahXydj/jLTRB4pHKLcIxdUeP1prpNCAAAA=',
	steps: [
		{
			description:
				'Lachs in Würfel schneiden, in eine Schale geben und mit dem Saft der Zitrone vermischen und kurz einziehen lassen.',
			linkedIngredients: [ingredients.salmon, ingredients.lemon]
		},
		{
			description: 'Zwiebeln und Knoblauch schneiden und leicht anbraten.',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{ description: 'Mit Weißwein ablöschen.', linkedIngredients: [ingredients.wine] },
		{
			description: 'Spinat, Sahne, Schmelzkäse und Parmesan dazu geben.',
			linkedIngredients: [
				ingredients.spinach,
				ingredients.cream,
				ingredients.cheeese,
				ingredients.parmesan
			]
		},
		{ description: 'Lachs in einer Pfanne leicht anbraten.' },
		{
			description:
				'Lachs in den Topf geben und mit klarer Brühe (Pulver), Salz und Pfeffer würzen und alles auf geringer Hitze durchziehen lassen.',
			linkedIngredients: [ingredients.stock, ingredients.salt, ingredients.pepper]
		},
		{ description: 'Mit Bandnudeln servieren.' }
	],
	ingredients: Object.values(ingredients)
};
