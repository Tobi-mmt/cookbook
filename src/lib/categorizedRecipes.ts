import type { Category } from '../types';

type CategorizedRecipes<T> = {
	[key in Category]: T[];
};

export const categorize = <T extends { meta: { category: Category } }>(recipes: T[]) =>
	recipes.reduce<CategorizedRecipes<T>>(
		(acc, recipe) => {
			if (acc[recipe.meta.category]) {
				acc[recipe.meta.category].push(recipe);
			} else {
				acc[recipe.meta.category] = [recipe];
			}
			return acc;
		},
		{ Salat: [], Herzhaft: [], Süßspeise: [], Getränke: [] }
	);
