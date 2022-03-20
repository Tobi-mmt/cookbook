import type { Recipe } from '../../types';

export const persianBeans: Recipe = {
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		vegetarian: true,
		vegan: false
	},
	title: 'Persiche Bohnenpfanne',
	image: '/recipes/persian-beans.webp',
	description: [
		'Bohnen spülen und im Sieb abtropfen lassen.',
		'Zwiebel schälen und in Halbringe schneiden.',
		'Knoblauch schälen und würfeln.',
		'Dill waschen und fein hacken.',
		'Zitrone waschen und Schale abreiben. Danach Zitrone auspressen.',
		'Zwiebelringe in der Pfanne mit Butter kurz anbraten.',
		'Kurkuma und Knoblauch dazu geben und dünsten lassen.',
		'Bohnen, Kreuzkümmel, Wasser, Zucken und Zitronensaft hinzugeben und mit Salz und Pfeffer abschmecken.',
		'Tomaten, Zitronenschale und Dill hinzugeben und köcheln lassen.',
		'Kleine Mulden in den Bohnen drücken und dort die Eier hineinschlagen.',
		'4 Minuten mit Deckel köcheln lassen.',
		'Mit Fladenbrot servieren.'
	],
	ingredients: [
		{ quantity: 10, unit: 'g', name: 'Dill' },
		{ quantity: 1, name: 'Zwiebel' },
		{ quantity: 0.5, name: 'Zitrone' },
		{ quantity: 100, unit: 'g', name: 'Tomaten' },
		{ quantity: 4, name: 'Tomaten' },
		{ quantity: 400, unit: 'g', name: 'weiße Bohnen aus der Dose' },
		{ quantity: 2, unit: 'EL', name: 'Butter' },
		{ quantity: 0.5, unit: 'TL', name: 'Kurkuma' },
		{ quantity: 1, unit: 'TL', name: 'Zucker' },
		{ quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
		{ quantity: 160, unit: 'ml', name: 'Wasser' },
		{ quantity: 0.5, unit: 'TL', name: 'Kreuzkümmel' }
	]
};
