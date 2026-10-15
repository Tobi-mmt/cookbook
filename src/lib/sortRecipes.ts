import type { Category } from '../types';

/** Sorts by the position of the category and then by title */
export const sortRecipes = <T extends { title: string; meta: { category: Category } }>(
	recipes: T[]
): T[] =>
	[...recipes].sort(
		(a, b) =>
			a.meta.category.position - b.meta.category.position ||
			(a.title < b.title ? -1 : a.title > b.title ? 1 : 0)
	);
