import type { RecipeInput } from '#lib/recipeInput.js';
import { saveRecipeAction } from '#lib/server/adminActions.js';

export function load() {
	const recipe: RecipeInput = {
		title: '',
		description: null,
		sourceUrl: null,
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
