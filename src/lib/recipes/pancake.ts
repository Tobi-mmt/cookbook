import type { Recipe } from '../../types';

export const pancake: Recipe = {
	meta: {
		portion: 12,
		duration: 20,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Pfannkuchen',
	image: '/recipes/pfannkuchen.webp',
	description: [
		'Mehl, Milch, Eier und eine Prise Salz mit dem Handrührgerät zu einem glatten Teig verrühren, bis dieser leichte Blasen wirft.',
		'Teig für ca. 30 Minuten im Kühlschrank ruhen lassen.',
		'Den Teig aus dem Kühlschrank nehmen, noch einen guten Schuss Mineralwasser hinzufügen und das Ganze nochmals kurz durchrühren.',
		'Die Pfannenkuchen in einer beschichteten Pfanne mit etwas Butter heraus braten, bis sie goldgelb sind.'
	],
	ingredients: [
		{ quantity: 400, unit: 'g', name: 'Mehl' },
		{ quantity: 750, unit: 'ml', name: 'Milch' },
		{ quantity: 1, unit: 'Prise', name: 'Salz' },
		{ quantity: 3, name: 'Eier' },
		{ quantity: 1, unit: 'Schuss', name: 'Mineralwasser' }
	]
};
