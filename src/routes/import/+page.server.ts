import { redirect } from '@sveltejs/kit';
import { importRecipeAction } from '#lib/server/recipeActions.js';

export const config = { maxDuration: 60 };

/** Importing lives at the top of the new recipe page, the action stays here */
export function load({ url }) {
	const cookbook = url.searchParams.get('kochbuch');
	redirect(308, `/neu?link${cookbook ? `&kochbuch=${encodeURIComponent(cookbook)}` : ''}`);
}

export const actions = {
	default: importRecipeAction
};
