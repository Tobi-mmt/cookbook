import type { NutritionType } from '../types';

export const DIET_LANDINGS: { slug: string; nutritionType: NutritionType; title: string }[] = [
	{ slug: 'vegan', nutritionType: 'Vegan', title: 'Vegane Rezepte' },
	{ slug: 'vegetarisch', nutritionType: 'Vegetarisch', title: 'Vegetarische Rezepte' },
	{ slug: 'fisch', nutritionType: 'Fisch', title: 'Rezepte mit Fisch' },
	{ slug: 'fleisch', nutritionType: 'Fleisch', title: 'Rezepte mit Fleisch' }
];

export type Landing = { slug: string; title: string; count: number };

export const landingPath = (slug: string) => `/rezepte/${slug}`;
