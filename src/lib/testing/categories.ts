import type { Category } from '../../types';

const SLUGS = [
	['fruehstueck', 'Frühstück', '#F2A65A'],
	['vorspeise-snack', 'Vorspeise & Snack', '#4FB3A9'],
	['suppe', 'Suppe', '#C9785B'],
	['salat', 'Salat', '#57B16B'],
	['hauptgericht', 'Hauptgericht', '#DD5D58'],
	['beilage-sosse', 'Beilage & Soße', '#5B8DC9'],
	['backen-dessert', 'Backen & Dessert', '#8882A8'],
	['getraenke', 'Getränke', '#F0CD5B']
];

/** The categories of the migration `0005_categories.sql` */
export const allTestCategories: Category[] = SLUGS.map(([slug, name, color], index) => ({
	id: index + 1,
	slug,
	name,
	color,
	position: index + 1
}));

const bySlug = (slug: string) => allTestCategories.find((category) => category.slug === slug)!;

export const testCategories = {
	salat: bySlug('salat'),
	hauptgericht: bySlug('hauptgericht'),
	backen: bySlug('backen-dessert'),
	getraenke: bySlug('getraenke')
};
