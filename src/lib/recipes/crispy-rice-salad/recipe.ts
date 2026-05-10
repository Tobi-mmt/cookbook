import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Salat' },
	reis: { quantity: 250, unit: 'g', name: 'Reis' },
	miniGurken: { quantity: 3, name: 'Mini Gurken' },
	fruehlingszwiebeln: { quantity: 1, unit: 'Bund', name: 'Frühlingszwiebeln' },
	koriander: { quantity: 1, unit: 'Bund', name: 'Koriander' },
	tempeh: { quantity: 1, unit: 'Block', name: 'Tempeh' },
	sesam: { name: 'Sesam' },
	neutralesOel: { name: 'Neutrales Öl' },
	sojasauce: { name: 'Sojasoße' },

	section2: { section: 'Dressing' },
	erdnussbutter: { quantity: 2, unit: 'EL', name: 'Erdnussbutter' },
	sojasauceDressing: { quantity: 2, unit: 'EL', name: 'Sojasoße' },
	sesamoel: { quantity: 2, unit: 'EL', name: 'Sesamöl' },
	limette: { quantity: 1, name: 'Limette' },
	knoblauch: { quantity: 1, unit: 'kleine Zehe', name: 'Knoblauch' },
	ingwer: { name: 'Ingwer (kleines Stück)' },
	ahornsirup: { name: 'Ahornsirup' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const crispyRiceSalad: Recipe = {
	id: '5854d02a26167fb', // generated with "yarn get-random-id"
	meta: {
		portion: 4,
		duration: 45,
		category: 'Salat',
		nutritionType: 'Vegan'
	},
	title: 'Crispy Reis Salat',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage: '',
	steps: [
		{ section: 'Vorbereitung' },
		{
			description: 'Reis kochen und auf einem Blech auskühlen lassen.',
			linkedIngredients: [ingredients.reis]
		},
		{ description: 'Den Ofen auf 180 °C vorheizen.' },
		{
			description: 'Mini Gurken smashen und in kleine Stücke schneiden.',
			linkedIngredients: [ingredients.miniGurken]
		},
		{
			description: 'Frühlingszwiebeln halbieren und in dünne Ringe schneiden.',
			linkedIngredients: [ingredients.fruehlingszwiebeln]
		},
		{
			description: 'Koriander hacken.',
			linkedIngredients: [ingredients.koriander]
		},
		{
			description: 'Tempeh in kleine Stücke zerbröseln.',
			linkedIngredients: [ingredients.tempeh]
		},
		{ section: 'Backen' },
		{
			description: 'Reis und Tempeh jeweils mit etwas Öl und Sojasoße mischen.',
			linkedIngredients: [ingredients.neutralesOel, ingredients.sojasauce]
		},
		{
			description:
				'Für 15–20 Minuten im Ofen backen, bis beides knusprig ist. Zwischendurch wenden.'
		},
		{ section: 'Dressing' },
		{
			description: 'Knoblauch und Ingwer fein reiben.',
			linkedIngredients: [ingredients.knoblauch, ingredients.ingwer]
		},
		{
			description:
				'Mit Erdnussbutter, Sojasoße, Sesamöl, Limettensaft und Ahornsirup vermischen. Etwas Wasser hinzufügen, damit das Dressing geschmeidiger wird.',
			linkedIngredients: [
				ingredients.erdnussbutter,
				ingredients.sojasauceDressing,
				ingredients.sesamoel,
				ingredients.limette,
				ingredients.ahornsirup
			]
		},
		{ section: 'Fertigstellen' },
		{
			description:
				'Reis und Tempeh kurz auskühlen lassen, dann alles mit dem Gemüse, Sesam und dem Dressing in einer großen Schüssel vermengen.',
			linkedIngredients: [ingredients.sesam]
		},
		{ description: 'Für extra Schärfe mit Crispy Chili Oil toppen.' }
	],
	ingredients: Object.entries(ingredients).map(([key, value]) => ({ ...value, key }))
};
