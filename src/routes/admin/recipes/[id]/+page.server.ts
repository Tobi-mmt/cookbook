import { error } from '@sveltejs/kit';
import { saveRecipeAction } from '$lib/server/adminActions';
import { getDb } from '$lib/server/context';
import { getRecipeInput } from '$lib/server/recipes';

export async function load({ params }) {
	const recipe = await getRecipeInput(getDb(), params.id);
	if (!recipe) error(404, 'Rezept nicht gefunden');

	return { id: params.id, recipe: recipe.input, image: recipe.image };
}

export const actions = {
	default: (event) => saveRecipeAction(event, event.params.id)
};
