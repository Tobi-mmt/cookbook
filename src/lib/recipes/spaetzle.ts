import type { Recipe } from '../../types';

const ingredients = {
	flour: { quantity: 300, unit: 'g', name: 'Mehl' },
	egg: { quantity: 6, name: 'Eier' },
	salt: { quantity: 1, unit: 'TL', name: 'Salz' },
	semolina: { quantity: 1, unit: 'EL', name: 'Grieß' },
	water: { quantity: 200, unit: 'ml', name: 'Wasser' }
};

export const spaetzle: Recipe = {
	id: '619c1e18f0760d4', // generated with "yarn get-random-id"
	meta: {
		portion: 5,
		duration: 40,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch'
	},
	title: 'Spätzle',
	image: '/recipes/spaetzle.webp',
	// placeholderImage generated with "yarn get-placeholder-image PATH/TO/IMAGE.webp"
	placeholderImage:
		'data:image/png;base64,UklGRr4AAABXRUJQVlA4ILIAAACwAgCdASoPAAoAAUAmJbACdLoAEInpAB40GxRwAwAA/ie5Ed6pnhHh20vH/C0SWnKIwCTGZId/Z2Ehyq7BlRf/T8+0p/rYkrzPf+79+sJ/+0oS4qDtrtbAHw4SkfqGUVkwmq3YluycOv5IpavS/0yDSmpyVD+HlXnIfmv9rL/rWm6n9RSVXLzLLQiTv/hizm95MZCVB21yA6PtUxzHLEnj/k+mHUkG0XwU9Ej+zsS2DiAA',
	steps: [
		{
			description:
				'Alle Zutaten in eine Schüssel geben und mit einem Kochlöffel kräftig rumrühren. Der Teig muss zäh werden. Mit Mehl und Wasser kann die Konsistenz angepasst werden. Für geschabte Spätzle etwas flüssiger, für gepresste etwas fester.',
			linkedIngredients: [
				ingredients.flour,
				ingredients.egg,
				ingredients.salt,
				ingredients.semolina,
				ingredients.water
			]
		},
		{
			description:
				'Um die Spätzle zu schaben, verwendet man ein flaches Brett und einen Schaber, ähnlich einer Spachtel. Hat man dies nicht zu Hand genügt auch die Rückseite eines Messers. Die Rückseite muss allerdings eine gerade, glatte Kante haben.'
		},
		{
			description:
				'Einen Topf mit kochendem Wasser aufsetzen, etwas Salz hineingeben. Das Brett nass machen und etwas Teig auf dem Brett verteilen. Danach mit dem Schaber oder Messer über den Teig auf dem Brett ziehen, dass alles flach verteilt wird. Mit dem Messer etwa 5 cm von der Brettkante in Richtung Kochtopf ansetzen und zügig in den Kochtopf schieben. Damit ist die erste Nudel gemacht. Dies einfach so lange wiederholen, bis der Teig verbraucht ist.'
		},
		{
			description:
				'Die Spätzle zwischendurch, etwa alle 5–10 Minuten, aus dem Wasser schöpfen und warm halten.'
		}
	],
	ingredients: Object.values(ingredients)
};
