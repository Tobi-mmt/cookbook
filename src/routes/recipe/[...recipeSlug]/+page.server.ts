import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { getRecipe } from '#lib/server/recipes.js';

export const config = isrConfig;

export async function load({ params }) {
	const recipeId = params.recipeSlug.split('/')[0];

	return { recipe: (await getRecipe(getDb(), recipeId)) ?? null };
}
