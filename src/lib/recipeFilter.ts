import type { Category, NutritionType } from '../types';

export type Diet = 'Vegetarisch' | 'Vegan';
export type RecipeFilter = { category?: Category; diet?: Diet };

/** Vegan recipes are vegetarian as well */
const DIETS: Record<Diet, NutritionType[]> = {
	Vegetarisch: ['Vegetarisch', 'Vegan'],
	Vegan: ['Vegan']
};

export const filterRecipes = <
	T extends { meta: { category: Category; nutritionType: NutritionType } }
>(
	recipes: T[],
	{ category, diet }: RecipeFilter
) =>
	recipes.filter(
		({ meta }) =>
			(!category || meta.category === category) &&
			(!diet || DIETS[diet].includes(meta.nutritionType))
	);
