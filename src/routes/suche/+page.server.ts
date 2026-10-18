import { inArray } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { listRecipeSummaries } from '#lib/server/recipes.js';
import { searchRecipes } from '#lib/server/search.js';
import { searchLandings } from '#lib/server/landings.js';

export async function load({ url, setHeaders }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const db = getDb();
	const [found, landings] = await Promise.all([
		searchRecipes(db, query, 60),
		searchLandings(db, query)
	]);
	const ids = found.map(({ id }) => id);
	const summaries = ids.length ? await listRecipeSummaries(db, inArray(recipes.id, ids)) : [];
	const byId = new Map(summaries.map((summary) => [summary.id, summary]));
	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300' });
	return { query, landings, recipes: ids.flatMap((id) => byId.get(id) ?? []) };
}
