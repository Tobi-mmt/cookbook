import type { Recipe } from '../../types';

export const fennelRisotto: Recipe = {
	meta: {
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		vegetarian: true,
		vegan: false
	},
	title: 'Risotto mit Fenchel und Champignons',
	image: '/recipes/fennel-risotto.webp',
	description: [
		'Knoblauch und Zwiebel schälen und würfeln.',
		'Beides in einem Topf mit etwas Öl anschwitzen.',
		'Risottoreis hinzugeben und 2 Minuten glasig braten.',
		'Wein hinzugeben und köcheln lassen bis die Flüssigkeit vollständig aufgesogen ist.',
		'Brühe hinzugeben und etwa 15 Minuten köcheln lassen.',
		'Fenchel waschen und grob würfeln.',
		'Fenchel mit etwas Öl in einer Pfanne goldbraun braten.',
		'Zucker hinzugeben und alles 3 Minuten in der Pfanne schwenken.',
		'Zitrone auspressen.',
		'Parmesan reiben.',
		'Fenchel, Butter, Zitronensaft und Parmesan zum Reis dazugeben und Mischen.',
		'Mit Chiliflocken, Salz und Pfeffer abschmecken und zur Seite stellen.',
		'Pilze waschen und grob würfeln.',
		'Pilze in einer Pfanne mit etwas Öl scharf anbraten.',
		'Frühlingszwiebeln waschen und in Ringe schneiden.',
		'Risotto in einen Teller geben und mit Pilzen und Frühlingszwiebeln garnieren.'
	],
	ingredients: [
		{ quantity: 1, name: 'Fenchel' },
		{ quantity: 1, name: 'Zwiebel' },
		{ quantity: 0.5, name: 'Frühlingszwiebel' },
		{ quantity: 0.5, name: 'Zitrone' },
		{ quantity: 150, unit: 'g', name: 'Champignons' },
		{ quantity: 40, unit: 'g', name: 'Parmesan' },
		{ quantity: 150, unit: 'g', name: 'Risottoreis' },
		{ quantity: 150, unit: 'ml', name: 'Weißwein' },
		{ quantity: 2, unit: 'EL', name: 'Butter' },
		{ quantity: 2, unit: 'Zehen', name: 'Knoblauch' },
		{ quantity: 1, unit: 'TL', name: 'Rohrzucker' },
		{ quantity: 1, unit: 'TL', name: 'Chiliflocken' },
		{ quantity: 500, unit: 'ml', name: 'Gemüsebrühe' }
	]
};
