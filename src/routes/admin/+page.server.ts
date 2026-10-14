import { deleteRecipeAction } from '#lib/server/adminActions.js';
import { getDb } from '#lib/server/context.js';
import { listRecipeIndex } from '#lib/server/recipes.js';

export async function load() {
	return { recipes: await listRecipeIndex(getDb()) };
}

export const actions = {
	delete: deleteRecipeAction
};
