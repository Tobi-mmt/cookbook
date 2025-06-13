import type { Recipe } from '../../../types';

const ingredients = {
	section1: { section: 'Teig' },
	flour: { quantity: 500, unit: 'g', name: 'Mehl' },
	butter: { quantity: 100, unit: 'g', name: 'Butter' },
	milk: { quantity: 200, unit: 'ml', name: 'Milch' },
	egg: { quantity: 2, name: 'Eier' },
	salt: { quantity: 1, unit: 'priese', name: 'Salz' },
	yeast: { quantity: 20, unit: 'g', name: 'Hefe' },
	section2: { section: 'In der Pfanne' },
	butter2: { quantity: 50, unit: 'g', name: 'Butter' },
	milk2: { quantity: 150, unit: 'ml', name: 'Milch' },
	salt2: { quantity: 1, unit: 'priese', name: 'Salz' }
};

// @ts-expect-error - we have to add the "?enhanced" to the image path to generate the enhanced image with @sveltejs/enhanced-img
import RecipeImage from './image.webp?enhanced';

export const yeastDumplings: Recipe = {
	id: 'b14415790b6dd2d', // generated with "yarn get-random-id"
	meta: {
		portion: 10,
		duration: 120,
		category: 'Süßspeise',
		nutritionType: 'Vegetarisch'
	},
	title: 'Dampfnudeln',
	image: RecipeImage,
	// placeholderImage generated with "yarn get-thumbnail PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRrIAAABXRUJQVlA4IKYAAACQAgCdASoPAAsAAUAmJbACdB2gDYxvNUCaIvO3AAD++piaLB5pmJeP00+Ej9nH8cn7zRSyGTMFMEy93+/jXFt00n6ewO/tDCyM++R/TkvbWjsv42Zr2rO2d/Xf+g/HT+P+Im84neGl1XWFP/kR/TwinWjUw79v7FWwftz23AwGYjHs739T5g1kS+/ideK7IPrFbbhEuv30uLr+3D3zo3pqQnJDAAAA',
	steps: [
		{
			description:
				'Aus Mehl, Butter, Eiern, lauwarmer Milch, Salz und aufgelöster Hefe einen Teig rühren. Dabei so lange schlagen, bis er Blasen wirft.',
			linkedIngredients: [
				ingredients.flour,
				ingredients.butter,
				ingredients.egg,
				ingredients.milk,
				ingredients.salt,
				ingredients.yeast
			]
		},
		{
			description:
				'Teig an einen warmen Ort bringen und mit einem Küchentuch abgedeckt dort etwa 2 Stunden gehen lassen.'
		},
		{
			description: 'Danach den Teig in kleine Kugeln formen und wieder etwa 2 Stunden gehen lassen.'
		},
		{
			description:
				'In eine Pfanne Milch, Butter (wahlweise mit etwas Wasser vermischen) und eine Prise Salz geben. Das Ganze etwas aufwärmen, bis die Butter verlaufen ist.',
			linkedIngredients: [ingredients.butter2, ingredients.milk2, ingredients.salt2]
		},
		{
			description:
				'Nun die Teiglinge dicht an dicht in der Pfanne platzieren und mit einem Deckel verschließen.'
		},
		{
			description:
				'Das Ganze bei mittlerer Temperatur kochen lassen, bis die Milch vollständig verkocht ist und sich eine Kruste am Pfannenboden gebildet hat.'
		}
	],
	ingredients: Object.values(ingredients)
};
