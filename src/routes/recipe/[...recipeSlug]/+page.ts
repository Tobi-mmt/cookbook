import { recipes } from '$lib/recipes';

export async function load({ params }) {
	const { recipeSlug } = params;
	const recipeId = recipeSlug.split('/')[0];
	const foundRecipe = recipes.find((recipe) => {
		return recipe.id === recipeId;
	});

	return { recipe: foundRecipe };
}
