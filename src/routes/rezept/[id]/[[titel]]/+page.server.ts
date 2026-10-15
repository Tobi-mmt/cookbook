import { error, redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { getRecipe } from '#lib/server/recipes.js';
import { slugerize } from '#lib/slugerize.js';
import { eq } from 'drizzle-orm';
import { cookbooks, users } from '#lib/server/db/schema.js';
import { isNewAccount } from '#lib/server/profiles.js';

export const config = isrConfig;

export async function load({ params }) {
	const found = await getRecipe(getDb(), params.id);
	if (!found?.visible) error(404, 'Rezept nicht gefunden');

	const { recipe } = found;
	// the title in the address is only decoration, an old one leads to the current
	if (params.titel !== decodeURIComponent(slugerize(recipe.title))) {
		redirect(301, `/rezept/${recipe.id}/${slugerize(recipe.title)}`);
	}
	const owner = await getDb()
		.select({ createdAt: users.createdAt })
		.from(cookbooks)
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(eq(cookbooks.id, found.cookbookId));
	return { recipe, noindex: Boolean(owner[0] && isNewAccount(owner[0].createdAt)) };
}
