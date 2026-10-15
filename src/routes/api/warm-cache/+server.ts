import { error } from '@sveltejs/kit';
import { desc, isNotNull, isNull } from 'drizzle-orm';
import { CRON_SECRET } from '$app/env/private';
import { getDb } from '#lib/server/context.js';
import { recipes, users } from '#lib/server/db/schema.js';
import { LIST_PATHS, recipePaths, revalidate } from '#lib/server/revalidate.js';

const NEWEST_RECIPES = 200;

/**
 * Renders the most visited pages into the ISR cache: the home page, the profiles and the newest
 * recipes. All others render on their first visit. A deployment starts with an empty cache, so
 * this runs after every production deployment (`.github/workflows/warm-cache.yml`) and once a
 * week as Vercel cron (`vercel.json`), which keeps rarely visited pages from being evicted.
 */
export async function GET({ request, url }) {
	if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
		error(401, 'Unauthorized');
	}
	const db = getDb();
	const [people, newest] = await Promise.all([
		db.select({ username: users.username }).from(users).where(isNotNull(users.username)),
		db
			.select({ id: recipes.id, title: recipes.title })
			.from(recipes)
			.where(isNull(recipes.deletedAt))
			.orderBy(desc(recipes.updatedAt))
			.limit(NEWEST_RECIPES)
	]);
	const paths = [
		...LIST_PATHS,
		...people.map(({ username }) => `/@${username}`),
		...newest.flatMap(recipePaths)
	];
	const failed = await revalidate(url.origin, paths);
	return Response.json({ paths: paths.length, failed }, { status: failed.length ? 500 : 200 });
}
