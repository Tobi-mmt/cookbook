import { getDb } from '#lib/server/context.js';
import { searchRecipes } from '#lib/server/search.js';

/** The global search, cached briefly by the CDN per query */
export async function GET({ url }) {
	const results = await searchRecipes(getDb(), url.searchParams.get('q') ?? '');
	return Response.json(results, {
		headers: { 'cache-control': 'public, max-age=60, s-maxage=300' }
	});
}
