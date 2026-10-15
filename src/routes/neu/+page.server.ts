import { loadNewRecipePage } from '#lib/server/editorPage.js';
import { saveRecipeAction } from '#lib/server/recipeActions.js';

export const load = loadNewRecipePage;

export const actions = {
	default: (event) => saveRecipeAction(event)
};
