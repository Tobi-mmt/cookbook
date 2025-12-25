import type { Recipe } from '../../../types';

const ingredients = {
	groundSection: { section: 'Boden' },
	cookie: { quantity: 250, unit: 'g', name: 'Kakaokeks' },
	butter: { quantity: 80, unit: 'g', name: 'Butter' },
	fillingSection: { section: 'Füllung' },
	creamCheese: { quantity: 550, unit: 'g', name: 'Frischkäse' },
	sugar: { quantity: 150, unit: 'g', name: 'Zucker' },
	chocolate: { quantity: 200, unit: 'g', name: 'Schokolade' },
	cocoa: { quantity: 12, unit: 'g', name: 'Kakaopulver' },
	eggs: { quantity: 3, name: 'Eier' },
	cream: { quantity: 150, unit: 'ml', name: 'Sahne' },
	vanilla: { quantity: 1, unit: 'TL', name: 'Vanilleextrakt' },
	salt: { quantity: 1, unit: 'Prise', name: 'Salz' },
	ganacheSection: { section: 'Ganache' },
	chocolate2: { quantity: 100, unit: 'g', name: 'Schokolade' },
	cream2: { quantity: 100, unit: 'ml', name: 'Sahne' },
	toppingSection: { section: 'Topping' },
	chocolateTopping: { quantity: 100, unit: 'g', name: 'Schokolade' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const chocoScheescake: Recipe = {
	id: '4c68f83111df518', // generated with "yarn get-random-id"
	meta: {
		portion: 10,
		duration: 360,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Schokoladencheesecake',
	image: RecipeImage,
	description: '10 Portionen entsprechen einer Springform mit einem Durchmesser von 26 cm.',
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRpIAAABXRUJQVlA4IIYAAACQAgCdASoPAAsAAUAmJQBOgNO+zm82JJCB92qEgAD+4oiD2ryJQsHZeZuBhYMd6m1LgMh4aAaxA1VxkGXIPxX0giVu6KA1vO6hWLkZPbfgzWM0gbFSznQAudIXRVIn4m0nlIdAfrqrPXbhshMuqMA94bOGmklvoIosAW9h+Zx2haptw2w4AA==',

	steps: [
		{ section: 'Boden' },
		{
			description: 'Kakaokeks in eine Schüssel geben und sehr fein zerkleinern',
			linkedIngredients: [ingredients.cookie]
		},
		{
			description: 'Butter in eine Schüssel geben und schmelzen lassen.',
			linkedIngredients: [ingredients.butter]
		},
		{
			description: 'Kakaokeks und Butter vermengen.'
		},
		{ section: 'Füllung' },
		{ description: 'Wichtig: alles sollte etwa Zimmertemperatur haben.' },
		{
			description:
				'Frischkäse in eine Schüssel geben und mit dem Schneebesen oder Rühgerät zu einer glatten Masse verrühren.',
			linkedIngredients: [ingredients.creamCheese]
		},
		{
			description:
				'Nach und nach Zucker, Kakaopulver, Salz, Vanilleextrakt und Eier in die Frischkäsemasse geben und langsam verrühren.',
			linkedIngredients: [
				ingredients.sugar,
				ingredients.cocoa,
				ingredients.eggs,
				ingredients.vanilla,
				ingredients.salt
			]
		},
		{
			description: 'Schokolade schmelzen und kurz abkühlen lassen.',
			linkedIngredients: [ingredients.chocolate]
		},
		{
			description: 'Die geschmolzene Schokolade in die Frischkäsemasse geben und langsam verrühren.'
		},
		{
			description: 'Sahne in die Frischkäsemasse geben und langsam verrühren.',
			linkedIngredients: [ingredients.cream]
		},
		{
			description:
				'Kekskrümel in eine gefettete Springform geben, gleichmäßig verteilen und mit einem Glas festdrücken.'
		},
		{ description: 'Füllung in die Springform geben und glatt streichen.' },
		{
			description:
				'Springform in den Ofen geben auf ein Gitter. Ein Backblech darunter legen und mit kochendem Wasser etwa 2 cm auffüllen.'
		},
		{ description: '50 Minuten bei 150 °C Umluft backen lassen.' },
		{
			description:
				'Backofen ausschalten und Kuchen bei geöffnetem Spalt etwa 1 Stunde im Ofen abkühlen lassen.'
		},
		{ description: 'Kuchen mindestens 4 Stunden im Kühlschrank abkühlen lassen.' },
		{ section: 'Ganache' },
		{
			description: 'Sahne in eine Topf geben und etwas erhitzen.',
			linkedIngredients: [ingredients.cream2]
		},
		{
			description:
				'Schokolade zerkleinern, in die Sahne geben und gut verrühren, bis sie schön glatt ist.',
			linkedIngredients: [ingredients.chocolate2]
		},
		{
			description:
				'Den Kuchen aus der Springform nehmen und die Ganache mit einem Spachtel gleichmäßig auftragen.'
		},
		{ section: 'Topping' },
		{
			description: 'Schokolade zerkleinern und auf der Ganache verteilen.',
			linkedIngredients: [ingredients.chocolateTopping]
		}
	],
	ingredients: Object.values(ingredients)
};
