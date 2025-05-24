import type { Recipe } from '../../types';

const ingredients = {
	butterBeans: { quantity: 400, unit: 'g', name: 'Dicke weiße Bohnen' },
	oliveOil: { quantity: 1, unit: 'EL', name: 'Olivenöl' },
	shallot: { quantity: 1, name: 'Schalotte' },
	garlic: { quantity: 1, unit: 'TL', name: 'Knoblauch' },
	sundriedTomatoes: { quantity: 2, unit: 'EL', name: 'Getrocknete Tomaten' },
	harissa: { quantity: 2, unit: 'EL', name: 'Harissa' },
	coconutMilk: { quantity: 300, unit: 'ml', name: 'Kokosmilch' },
	vegetableBroth: { quantity: 100, unit: 'ml', name: 'Gemüsebrühe' },
	redPepperFlakes: { quantity: 1 / 2, unit: 'TL', name: 'Chiliflocken' },
	nutritionalYeast: { quantity: 70, unit: 'g', name: 'Hefeflocken' },
	kale: { quantity: 1, unit: 'Handvoll', name: 'Grünkohl, zerrissen' },
	salt: { name: 'Salz' },
	blackPepper: { name: 'Schwarzer Pfeffer' }
};

export const harissaBeans: Recipe = {
	id: '9bccab94789af4a', // generated with "yarn get-random-id"
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Harissa-Bohnen-Eintopf',
	image: '/recipes/harissa-beans.webp',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRuQAAABXRUJQVlA4INgAAAAQBACdASoPAA8AAUAmJbACdLoAs//JF6wBXJramzYvkH63F8Qe0RT6oAD+4D/9r+o68I0M3/Y1F8vPIcaHNJ6Ad53kertkfGKmhtQ4s29+f1ybuKlc+vFQgyTqZzEJTJElv3Db+QZkx+23kyXafaLrevWiKg2MxYTGcdqNg7LWvpx8ejgfg/jprWnqpfy+aqqj9oKoDwoR3S1z3+lq1jl7Hy0CPQuYg+P/+jBz/PR10X/uLzL72BCtsfbsZDy9/ejaV/GCrPgkSQX/VkCIXjx3Dp3c47wAAAA=',
	steps: [
		{
			description: 'Olivenöl in einer großen Pfanne bei mittlerer Hitze erhitzen.',
			linkedIngredients: [ingredients.oliveOil]
		},
		{
			description: 'Die Schalotten würfeln, hinzufügen und 1-2 Minuten anbraten.',
			linkedIngredients: [ingredients.shallot]
		},
		{
			description:
				'Knoblauch und getrocknete Tomaten klein hacken, hinzufügen und 2-3 Minuten anbraten.',
			linkedIngredients: [ingredients.garlic, ingredients.sundriedTomatoes]
		},
		{
			description: 'Bohnen und Harissa hinzugeben, dann Kokosmilch und Gemüsebrühe dazugeben.',
			linkedIngredients: [
				ingredients.butterBeans,
				ingredients.harissa,
				ingredients.coconutMilk,
				ingredients.vegetableBroth
			]
		},
		{
			description:
				'Mit Salz, Pfeffer, Chiliflocken und Nährhefe würzen. 2-3 Minuten köcheln lassen, bis die Sauce eindickt.',
			linkedIngredients: [
				ingredients.salt,
				ingredients.blackPepper,
				ingredients.redPepperFlakes,
				ingredients.nutritionalYeast
			]
		},
		{
			description:
				'Grünkohl einrühren und für weitere 2-3 Minuten köcheln lassen, gelegentlich umrühren.',
			linkedIngredients: [ingredients.kale]
		},
		{ description: 'Vom Herd nehmen und mit warmen Sauerteigbrot servieren.' }
	],
	ingredients: Object.values(ingredients)
};
