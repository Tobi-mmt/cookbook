import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/context';
import { isrConfig } from '$lib/server/isr';
import { listRecipeIndex } from '$lib/server/recipes';

export const config = isrConfig;

/** Recipe list for the menu and the search */
export async function GET() {
	return json(await listRecipeIndex(getDb()));
}
