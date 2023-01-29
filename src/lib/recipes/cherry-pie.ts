import type { Recipe } from '../../types';

const ingredients = {
	doughSection: { section: 'Mürbteig' },
	flourDoughSection: { quantity: 250, unit: 'g', name: 'Mehl' },
	margarine: { quantity: 50, unit: 'g', name: 'Margarine' },
	sugarDougSection: { quantity: 80, unit: 'g', name: 'Zucker' },
	egg: { quantity: 1, name: 'Ei' },
	milk: { quantity: 1, unit: 'Schuss', name: 'Milch' },
	bakingBowder: { quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },

	coverSection: { section: 'Kirschbelag' },
	cherryJuice: { quantity: 0.5, unit: 'L', name: 'des Kirschsaftes' },
	sugarCoverSection: { quantity: 3, unit: 'EL', name: 'Zucker' },
	redGlaze: { quantity: 2, unit: 'Pck.', name: 'Roter Tortenguss' },
	cherry: { quantity: 700, unit: 'g', name: 'abgetropfte Kirschen' },

	sprinkelsSection: { section: 'Streusel' },
	flourSprinkelsSection: { quantity: 90, unit: 'g', name: 'Mehl' },
	buttter: { quantity: 90, unit: 'g', name: 'Butter' },
	hazelnut: { quantity: 90, unit: 'g', name: 'geriebene Haselnüsse' },
	sugarSprinkelsSection: { quantity: 90, unit: 'g', name: 'Zucker' },
	cinemon: { name: 'Zimt' },

	topingSection: { section: 'Topping' },
	sugarTopingSection: { quantity: 2, unit: 'EL', name: 'Zucker' },
	cream: { quantity: 400, unit: 'g', name: 'Schlagsahne' }
};

export const cherryPie: Recipe = {
	id: 'c0af6df3a5a0ba5', // generated with "yarn get-random-id"
	meta: {
		portion: 10,
		duration: 50,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Kirschkuchen mit Streuseln',
	image: '/recipes/kirschkuchen.webp',
	// placeholderImage generated with "yarn get-placeholder-image PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpwAAABXRUJQVlA4IJAAAACwAgCdASoPAAsAAUAmJbACdDBWiIiL0fuNFEs0zAAA/ugtQaeVy0OwSYF7ZAQkYJbv5E+gZdiPb2y/bHA8kPn0RON91J42B1sXZzpAH76Ysp0ZZAx2/56GZ5U6U9aD46CrNY5Am9/qlxnkaEWbRDTOr0mTSFk+UBTWYF5n7UROMWv165RJPx5nnJv/l3AAAAA=',
	steps: [
		{
			description:
				'Zutaten für den Mürbteig in eine Schüssel geben und gut vermengen. Ist der Teig nicht mürbe genug noch etwas Mehl hinzugeben.',
			linkedIngredients: [
				ingredients.flourDoughSection,
				ingredients.margarine,
				ingredients.sugarDougSection,
				ingredients.egg,
				ingredients.milk,
				ingredients.bakingBowder
			]
		},
		{ description: 'Teig dünn ausrollen.' },
		{
			description: `Eine hohe Springform mit etwas Butter einfetten und den Teig vorsichtig hineinlegen. Der
    Teig sollte bis an den Rand der Springform reichen.`
		},
		{
			description:
				'Die Gläser mit den Sauerkirschen durch ein Sieb leeren, den Saft der Gläser in einem Messbecher auffangen.',
			linkedIngredients: [ingredients.cherry, ingredients.cherryJuice]
		},
		{
			description:
				'Den Kirschsaft in einen Topf geben und erhitzen und dann den Tortenguss hinzugeben',
			linkedIngredients: [ingredients.cherryJuice, ingredients.redGlaze]
		},
		{
			description: 'So bald die Flüssig zähflüssig wird die Kirschen dazu geben und gut verrühren.'
		},
		{ description: 'Den Topf vom Herd nehmen und für 10 Minuten abkühlen lassen.' },
		{ description: 'Den Inhalt des abgekühlten Topfes gleichmäßig in der Springform verteilen.' },
		{
			description:
				'Alle Zutaten der Streusel in einer Schüssel gut durchkneten, bis kleine Streusel entstehen.',
			linkedIngredients: [
				ingredients.flourSprinkelsSection,
				ingredients.buttter,
				ingredients.hazelnut,
				ingredients.sugarSprinkelsSection,
				ingredients.cinemon
			]
		},
		{ description: 'Streusel über die Kirschmasse geben.' },
		{ description: '40 Minuten bei 180 °C Umluft backen lassen.' },
		{ description: 'Den Kuchen gut auskühlen lassen, bevor die Sahne darauf kommt.' },
		{
			description: 'Schlagsahne steif schlagen und einen Esslöffel Zucker dazu geben.',
			linkedIngredients: [ingredients.cream]
		},
		{
			description:
				'Die Sahne auf dem abgekühlten Kuchen verteilen und für die Optik mit einer Gabel ein Wellenmuster in die Sahne malen.'
		}
	],

	ingredients: Object.values(ingredients)
};
