import { error } from '@sveltejs/kit';
import { requireEditor } from '#lib/server/auth/guards.js';
import { listCategories } from '#lib/server/categories.js';
import { getDb } from '#lib/server/context.js';
import { deleteRecipeAction, saveRecipeAction } from '#lib/server/recipeActions.js';
import { getRecipeInput } from '#lib/server/recipes.js';
import { redirect } from '@sveltejs/kit';
import { cookbookUrl } from '#lib/server/cookbooks.js';

export async function load(event) {
	const db = getDb();
	const recipe = await getRecipeInput(db, event.params.id);
	if (!recipe) error(404, 'Rezept nicht gefunden');
	const editor = await requireEditor(event, recipe.cookbookId);

	return {
		id: event.params.id,
		recipe: recipe.input,
		image: recipe.image,
		categories: await listCategories(db),
		asAdmin: editor.asAdmin,
		version: recipe.version
	};
}

export const actions = {
	save: (event) => saveRecipeAction(event, event.params.id),
	delete: async (event) => {
		const recipe = await deleteRecipeAction(event, event.params.id);
		redirect(303, `${await cookbookUrl(getDb(), recipe.cookbookId)}?geloescht`);
	}
};
