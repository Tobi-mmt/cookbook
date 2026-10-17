import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { cookbooks, users } from '#lib/server/db/schema.js';
import { isrConfig } from '#lib/server/isr.js';
import { isNewAccount } from '#lib/server/profiles.js';
import { getRecipe } from '#lib/server/recipes.js';
import { recipeMarkdown } from '#lib/recipeText.js';

export const config = isrConfig;

export async function GET({ params, url }) {
	const db = getDb();
	const found = await getRecipe(db, params.file);
	if (!found?.visible) error(404, 'Rezept nicht gefunden');
	const [owner] = await db
		.select({ createdAt: users.createdAt })
		.from(cookbooks)
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(eq(cookbooks.id, found.cookbookId));

	return new Response(recipeMarkdown(found.recipe, url.origin), {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			...(owner && isNewAccount(owner.createdAt) && { 'x-robots-tag': 'noindex' })
		}
	});
}
