import { error } from '@sveltejs/kit';
import { saveRecipeAction } from '#lib/server/adminActions.js';
import { getDb } from '#lib/server/context.js';
import { getRecipeInput } from '#lib/server/recipes.js';

export async function load({ params }) {
	const recipe = await getRecipeInput(getDb(), params.id);
	if (!recipe) error(404, 'Rezept nicht gefunden');

	return { id: params.id, recipe: recipe.input, image: recipe.image };
}

export const actions = {
	default: (event) => saveRecipeAction(event, event.params.id)
};
