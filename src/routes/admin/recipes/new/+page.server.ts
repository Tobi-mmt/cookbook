import type { RecipeInput } from '$lib/recipeInput';
import { saveRecipeAction } from '$lib/server/adminActions';

export function load() {
	const recipe: RecipeInput = {
		title: '',
		description: null,
		portion: 2,
		duration: 30,
		category: 'Herzhaft',
		nutritionType: 'Vegetarisch',
		ingredients: [],
		steps: [{ kind: 'step', text: '', links: [] }]
	};
	return { recipe, image: null };
}

export const actions = {
	default: (event) => saveRecipeAction(event)
};
