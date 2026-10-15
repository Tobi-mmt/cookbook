import { error, redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { getRecipe } from '#lib/server/recipes.js';
import { slugerize } from '#lib/slugerize.js';

export const config = isrConfig;

export async function load({ params }) {
	const found = await getRecipe(getDb(), params.id);
	if (!found?.visible) error(404, 'Rezept nicht gefunden');

	const { recipe } = found;
	// the title in the address is only decoration, an old one leads to the current
	if (params.titel !== decodeURIComponent(slugerize(recipe.title))) {
		redirect(301, `/rezept/${recipe.id}/${slugerize(recipe.title)}`);
	}
	return { recipe };
}
