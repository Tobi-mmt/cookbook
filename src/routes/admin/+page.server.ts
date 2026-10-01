import { deleteRecipeAction } from '$lib/server/adminActions';
import { getDb } from '$lib/server/context';
import { listRecipeIndex } from '$lib/server/recipes';

export async function load() {
	return { recipes: await listRecipeIndex(getDb()) };
}

export const actions = {
	delete: deleteRecipeAction
};
