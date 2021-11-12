import type { Recipe } from '../../types';

export const cherryPie: Recipe = {
	meta: {
		portion: 10,
		duration: 50,
		category: 'Süßspeise',
		vegetarian: true
	},
	title: 'Kirschkuchen mit Streuseln',
	image: '/recipes/kirschkuchen.webp',
	description: [
		'Zutaten für den Mürbteig in eine Schüssel geben und gut vermengen. Ist der Teig nicht mürbe genug noch etwas Mehl hinzugeben.',
		'Teig dünn ausrollen.',
		`Eine hohe Springform mit etwas Butter einfetten und den Teig vorsichtig hineinlegen. Der
    Teig sollte bis an den Rand der Springform reichen.`,
		'Die Gläser mit den Sauerkirschen durch ein Sieb leeren, den Saft der Gläser in einem Messbecher auffangen.',
		'0,5 Liter des Saftes mit den Kirschen und dem Tortenguss in einen Topf geben und erhitzen, dabei immer gut rumrühren.',
		'Ist der Saft heiß und leicht zähflüssig, sollte er für 10 Minuten auf einer kühlen Herdplatte stehen.',
		'Den Inhalt des abgekühlten Topfes gleichmäßig in der Springform verteilen.',
		'Alle Zutaten der Streusel in einer Schüssel gut durchkneten, bis kleine Streusel entstehen.',
		'Streusel über die Kirschmasse geben.',
		'40 Minuten bei 180 °C Umluft backen lassen.',
		'Den Kuchen gut auskühlen lassen, bevor die Sahne darauf kommt.',
		'2 Becher Sahne steif schlagen und ein Esslöffel Zucker dazu geben.',
		'Die Sahne auf dem abgekühlten Kuchen verteilen und für die Optik mit einer Gabel ein Wellenmuster in die Sahne malen.'
	],
	ingredients: [
		{ section: 'Mürbteig' },
		{ quantity: 250, unit: 'g', name: 'Mehl' },
		{ quantity: 50, unit: 'g', name: 'Margarine' },
		{ quantity: 80, unit: 'g', name: 'Zucker' },
		{ quantity: 1, name: 'Ei' },
		{ quantity: 1, unit: 'Schuss', name: 'Milch' },
		{ quantity: 0.5, unit: 'Pck.', name: 'Backpulver' },
		{ section: 'Kirschbelag' },
		{ quantity: 0.5, unit: 'L', name: 'des Kirschsaftes' },
		{ quantity: 3, unit: 'EL', name: 'Zucker' },
		{ quantity: 1, unit: 'Pck.', name: 'Roter Tortenguss' },
		{ name: 'abgetropfte Kirschen' },
		{ section: 'Streusel' },
		{ quantity: 90, unit: 'g', name: 'Mehl' },
		{ quantity: 90, unit: 'g', name: 'Butter' },
		{ quantity: 90, unit: 'g', name: 'geriebene Haselnüsse' },
		{ quantity: 90, unit: 'g', name: 'Zucker' },
		{ name: 'Zimt' }
	]
};
