import type { NutritionType } from '../types';

export type LandingKind = 'category' | 'diet' | 'ingredient';

export type Landing = {
	kind: LandingKind;
	slug: string;
	title: string;
	name: string;
	count: number;
};

export const DIET_LANDINGS: { slug: string; nutritionType: NutritionType; title: string }[] = [
	{ slug: 'vegan', nutritionType: 'Vegan', title: 'Vegane Rezepte' },
	{ slug: 'vegetarisch', nutritionType: 'Vegetarisch', title: 'Vegetarische Rezepte' },
	{ slug: 'fisch', nutritionType: 'Fisch', title: 'Rezepte mit Fisch' },
	{ slug: 'fleisch', nutritionType: 'Fleisch', title: 'Rezepte mit Fleisch' }
];

export const landingPath = ({ kind, slug }: Pick<Landing, 'kind' | 'slug'>) =>
	kind === 'ingredient' ? `/rezepte/mit/${slug}` : `/rezepte/${slug}`;

export const ingredientSlug = (name: string) =>
	name
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
