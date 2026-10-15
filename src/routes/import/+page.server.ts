import { loadNewRecipePage } from '#lib/server/editorPage.js';
import { importRecipeAction } from '#lib/server/recipeActions.js';

export const load = loadNewRecipePage;

export const actions = {
	default: importRecipeAction
};
