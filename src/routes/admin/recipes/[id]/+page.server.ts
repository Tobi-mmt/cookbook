import { error } from '@sveltejs/kit';
import { saveRecipeAction } from '#lib/server/adminActions.js';
import { listCategories } from '#lib/server/categories.js';
import { getDb } from '#lib/server/context.js';
import { getRecipeInput } from '#lib/server/recipes.js';

export async function load({ params }) {
	const db = getDb();
	const [recipe, categories] = await Promise.all([
		getRecipeInput(db, params.id),
		listCategories(db)
	]);
	if (!recipe) error(404, 'Rezept nicht gefunden');

	return { id: params.id, recipe: recipe.input, image: recipe.image, categories };
}

export const actions = {
	default: (event) => saveRecipeAction(event, event.params.id)
};
