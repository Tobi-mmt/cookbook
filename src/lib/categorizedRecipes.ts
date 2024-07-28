import { recipes } from './recipes';
import type { Recipe, Category } from '../types';

type CategorizedRecipe = {
	[key in Category]: Recipe[];
};
export const categorizedRecipes = recipes.reduce<CategorizedRecipe>(
	(acc, recipe) => {
		if (acc[recipe.meta.category]) {
			acc[recipe.meta.category as Category].push(recipe);
		} else {
			acc[recipe.meta.category] = [recipe];
		}
		return acc;
	},
	{ Salat: [], Herzhaft: [], Süßspeise: [], Getränke: [] }
);
