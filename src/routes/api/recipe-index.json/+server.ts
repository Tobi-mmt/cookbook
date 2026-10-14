import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { listRecipeIndex } from '#lib/server/recipes.js';

export const config = isrConfig;

/** Recipe list for the menu and the search */
export async function GET() {
	return Response.json(await listRecipeIndex(getDb()));
}
