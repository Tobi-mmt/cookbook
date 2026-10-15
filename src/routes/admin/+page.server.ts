import { getDb } from '#lib/server/context.js';
import { listRecipeIndex } from '#lib/server/recipes.js';

export async function load() {
	return { recipes: await listRecipeIndex(getDb()) };
}
