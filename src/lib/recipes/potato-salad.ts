import type { Recipe } from '../../types';

export const potatoSalad: Recipe = {
	meta: {
		portion: 6,
		duration: 20,
		category: 'Salat',
		nutritionType: 'Vegan'
	},
	title: 'Kartoffelsalat',
	image: '/recipes/kartoffelsalat.webp',
	description: [
		'Die Kartoffeln schälen und kochen, bis sie durch sind.',
		'Kartoffeln in Scheiben schneiden und in eine Schüssel geben.',
		'Die Brühe in einer Tasse mit heißem Wasser auflösen lassen. Diese danach über die Kartoffeln schütten.',
		`Eine Zwiebel in kleine Würfel schneiden und zusammen mit Salz, Pfeffer, Essig, Öl in die Schüssel geben und alles gut durchmischen.
    Nun wird so lange Wasser hinzugegeben, bis der Kartoffelsalat „nass“ aber NICHT suppenartig ist.`,
		'Den fertigen Salat warm servieren – schmeckt auch kalt sehr gut.'
	],
	ingredients: [
		{ name: 'Kartoffeln, festkochend', quantity: 2, unit: 'kg' },
		{ name: 'Zwiebel', quantity: 1 },
		{ name: 'Brühe', quantity: 200, unit: 'ml' },
		{ name: 'Salz' },
		{ name: 'Pfeffer' },
		{ name: 'Essig' },
		{ name: 'Öl' },
		{ name: 'Wasser' }
	]
};
