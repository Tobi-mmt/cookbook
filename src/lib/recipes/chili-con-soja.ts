import type { Recipe } from '../../types';

const ingredients = {
	soy: { quantity: 300, unit: 'g', name: 'Sojagranulat, fein' },
	stock: { quantity: 2, unit: 'TL', name: 'Gemüsebrühepulver' },
	chili: { quantity: 2, name: 'rote Chilischoten' },
	onion: { quantity: 2, name: 'große Zwiebeln' },
	garlic: { quantity: 1, unit: 'Zehe', name: 'Knoblauch' },
	cumin: { quantity: 1, unit: 'TL', name: 'Kreuzkümmel' },
	chiliPowder: { quantity: 2, unit: 'TL', name: 'Chilipulver' },
	tomato: { quantity: 3, unit: 'Dosen', name: 'Tomaten, gestückelt' },
	kidney: { quantity: 2, unit: 'Dosen', name: 'Kidneybohnen' },
	cinemon: { quantity: 1, name: 'Zimtstange' },
	salt: { name: 'Salz' },
	pepper: { name: 'Pfeffer' }
};

export const chiliConSoja: Recipe = {
	meta: {
		portion: 5,
		duration: 100,
		category: 'Herzhaft',
		nutritionType: 'Vegan'
	},
	title: 'Chili con Soja',
	image: '/recipes/chilli-con-carne.webp',
	steps: [
		{
			description:
				'Sojagranulat mit kochendem Wasser im Verhältnis 1:1 in einer Schüssel aufgießen und mit Gemüsebrühepulver vermischen. Ein paar Minuten einwirken lassen',
			linkedIngredients: [ingredients.soy, ingredients.stock]
		},
		{
			description:
				'Zwiebeln und Knoblauch würfeln und in heißem Öl kurz anschwitzen, bis sie weich sind.',
			linkedIngredients: [ingredients.onion, ingredients.garlic]
		},
		{
			description:
				'Gehackte Chilischoten mit Kernen, Kreuzkümmel und Chilipulver hinzufügen und weitere 2 Minuten dünsten.',
			linkedIngredients: [ingredients.chili, ingredients.cumin, ingredients.chiliPowder]
		},
		{
			description:
				'Das aufgeweichte Sojagranulat in den Topf geben und bei großer Hitze ringsherum krümelig anbraten.'
		},
		{
			description:
				'Die Dosentomaten und die Zimtstange unterrühren und mit Salz und Pfeffer kräftig würzen.',
			linkedIngredients: [
				ingredients.tomato,
				ingredients.cinemon,
				ingredients.salt,
				ingredients.pepper
			]
		},
		{
			description:
				'Alles bei geringer Hitze etwa 60 Minuten köcheln lassen, dabei gelegentlich umrühren.'
		},
		{
			description: 'Bohnen hinzufügen und weiter 30 Minuten köcheln lassen.',
			linkedIngredients: [ingredients.kidney]
		},
		{ description: 'Mit Weißbrot und einem Klecks Naturjoghurt oder Guacamole servieren.' },
		{
			description:
				'Noch besser schmeckt es, wenn man das Chili con Soja schon am Vortag zubereitet.'
		}
	],
	ingredients: Object.values(ingredients)
};
