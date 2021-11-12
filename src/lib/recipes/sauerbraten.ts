import type { Recipe } from '../../types';

export const sauerbraten: Recipe = {
	meta: {
		portion: 8,
		duration: 180,
		category: 'Herzhaft'
	},
	title: 'Sauerbraten',
	image: '/recipes/sauerbraten.webp',
	description: [
		'Die Beize',
		'Rotwein und Essig mischen.',
		'Suppengrün putzen, waschen und zusammen mit den Zwiebeln klein schneiden.',
		'Pfefferkörner, Nelken, Wacholderbeeren und Pimentkörner im Mörser zerkleinern und in die Flüssigkeit geben.',
		'Schmorbraten in die Flüssigkeit legen, Suppengrün und Lorbeerblätter dazu geben. Der Schmorbraten muss mit Flüssigkeit bedeckt sein, falls nicht, einfach etwas Wasser hinzugeben.',
		'Das Ganze abdecken und 2–7 Tage kühl lagern. Je länger, desto zarter wird das Fleisch.',
		'',
		'Die Soße',
		'Das Fleisch aus der Beize nehmen, trocken tupfen, mit Salz einreiben und im Bräter rundherum anbraten.',
		'Nebenher die Beize durch ein Sieb geben, alles Feste wird zusammen mit Tomaten, Rosinen, Gemüsebrühpulver und dem Fleisch angebraten, die Flüssigkeit aufbewahren!',
		'Mit Butter und Mehl eine "Mehlschwitze" vorbereiten, in einem extra Topf.',
		'Mehlschwitze mit der Beize ablöschen und alles zusammen in den Bräter zum Fleisch geben.',
		'Alles für 30 Minuten zugedeckt köcheln lassen.',
		'Pumpernickel zerbröckeln und weitere 90 Minuten im geschlossenen Topf köcheln lassen.',
		'Fleisch heraus nehmen, in Scheiben schneiden und warm halten.',
		'Mit einem Pürierstab alles in der Soße zu einem Brei zerkleinern.',
		'Die Soße wird durch ein feines Sieb gegossen und das pürierte Gemüse so weit wie möglich durch das Sieb gedrückt.',
		'Fleisch wieder in die Soße geben oder extra anrichten.',
		'Dazu passen Spätzle und Blaukraut/Rotkraut.'
	],
	ingredients: [
		{ section: 'Beize' },
		{ quantity: 700, unit: 'ml', name: 'trockener Rotwein' },
		{ quantity: 200, unit: 'ml', name: 'Rotweinessig' },
		{ quantity: 1, unit: 'Bund', name: 'Suppengrün' },
		{ quantity: 4, name: 'Nelken' },
		{ quantity: 2, name: 'Lorbeerblätter' },
		{ quantity: 4, name: 'Wacholderbeeren' },
		{ quantity: 2, name: 'Pimentkörner' },
		{ quantity: 8, name: 'Pfefferkörner' },
		{ quantity: 1, unit: 'kg', name: 'Rinderschmorbraten' },
		{ section: 'Soße' },
		{ quantity: 1, name: 'Tomate' },
		{ quantity: 50, unit: 'g', name: 'Rosinen' },
		{ quantity: 100, unit: 'g', name: 'Pumpernickel' },
		{ quantity: 1, unit: 'EL', name: 'Gemüsebrühe (Pulver)' }
	]
};
