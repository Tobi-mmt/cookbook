import type { Category, NutritionType } from '../types';

export type Diet = 'Vegetarisch' | 'Vegan';
export type RecipeFilter = { category?: string; diet?: Diet };

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
			(!category || meta.category.slug === category) &&
			(!diet || DIETS[diet].includes(meta.nutritionType))
	);

/** The categories that occur in the recipes, in their order */
export const presentCategories = (recipes: { meta: { category: Category } }[]) =>
	[...new Map(recipes.map(({ meta }) => [meta.category.id, meta.category])).values()].sort(
		(a, b) => a.position - b.position
	);
