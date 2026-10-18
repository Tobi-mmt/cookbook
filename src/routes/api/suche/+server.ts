import { getDb } from '#lib/server/context.js';
import { searchLandings } from '#lib/server/landings.js';
import { searchRecipes } from '#lib/server/search.js';

/** The global search, cached briefly by the CDN per query */
export async function GET({ url }) {
	const query = url.searchParams.get('q') ?? '';
	const db = getDb();
	const [landings, recipes] = await Promise.all([
		searchLandings(db, query),
		searchRecipes(db, query)
	]);
	return Response.json(
		{ landings, recipes },
		{ headers: { 'cache-control': 'public, max-age=60, s-maxage=300' } }
	);
}
