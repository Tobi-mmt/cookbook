import { getDb } from '$lib/server/context';
import { isrConfig } from '$lib/server/isr';
import { getRecipe } from '$lib/server/recipes';

export const config = isrConfig;

export async function load({ params }) {
	const recipeId = params.recipeSlug.split('/')[0];

	return { recipe: (await getRecipe(getDb(), recipeId)) ?? null };
}
