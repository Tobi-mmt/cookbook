import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { listRecipeSummaries } from '#lib/server/recipes.js';

export const config = isrConfig;

export async function load() {
	return { recipes: await listRecipeSummaries(getDb()) };
}
