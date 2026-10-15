import { eq } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { isrConfig } from '#lib/server/isr.js';
import { listRecipeIndex } from '#lib/server/recipes.js';

export const config = isrConfig;

/** Titles and ingredients of a cookbook for the search on its page and the profiles */
export async function GET({ params }) {
	return Response.json(await listRecipeIndex(getDb(), eq(recipes.cookbookId, params.id)));
}
