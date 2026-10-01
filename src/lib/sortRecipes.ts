import type { Category } from '../types';
import { categoryColors } from './colors';

const getCatIndex = (category: Category) => Object.keys(categoryColors).indexOf(category);

/** Sorts by category (in the order of `categoryColors`) and then by title */
export const sortRecipes = <T extends { title: string; meta: { category: Category } }>(
	recipes: T[]
): T[] =>
	[...recipes].sort(
		(a, b) =>
			getCatIndex(a.meta.category) - getCatIndex(b.meta.category) ||
			(a.title < b.title ? -1 : a.title > b.title ? 1 : 0)
	);
