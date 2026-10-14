import { getDb } from '$lib/server/context';
import { isrConfig } from '$lib/server/isr';
import { listRecipeSummaries } from '$lib/server/recipes';

export const config = isrConfig;

export async function load() {
	return { recipes: await listRecipeSummaries(getDb()) };
}
