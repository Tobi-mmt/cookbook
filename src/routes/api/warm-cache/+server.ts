import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/context';
import { listRecipeIndex } from '$lib/server/recipes';
import { LIST_PATHS, recipePaths, revalidate } from '$lib/server/revalidate';

/**
 * Renders all public pages into the ISR cache, so that no visitor waits for a cold render.
 * A deployment starts with an empty cache, so this runs after every production deployment
 * (`.github/workflows/warm-cache.yml`) and once a day as Vercel cron (`vercel.json`),
 * which also keeps rarely visited recipes in the cache.
 */
export async function GET({ request, url }) {
	if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
		error(401, 'Unauthorized');
	}

	const recipes = await listRecipeIndex(getDb());
	const paths = [...LIST_PATHS, ...recipes.flatMap(recipePaths)];
	const failed = await revalidate(url.origin, paths);

	return json({ paths: paths.length, failed }, { status: failed.length ? 500 : 200 });
}
