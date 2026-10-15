import { eq, inArray } from 'drizzle-orm';
import type { Database } from './db/client';
import { cookbookEditors, cookbooks, users } from './db/schema';
import { LIST_PATHS, recipePaths } from './revalidate';

/**
 * The cached pages that show a change in the given cookbooks: their pages, the profiles of all
 * their editors, the lists and the given recipes under their current and former titles.
 */
export const affectedPaths = async (
	db: Database,
	{
		cookbookIds,
		recipes = []
	}: { cookbookIds: string[]; recipes?: { id: string; title: string }[] }
) => {
	const ids = [...new Set(cookbookIds)];
	const [books, editors] = ids.length
		? await Promise.all([
				db
					.select({ slug: cookbooks.slug, owner: users.username })
					.from(cookbooks)
					.innerJoin(users, eq(users.id, cookbooks.ownerId))
					.where(inArray(cookbooks.id, ids)),
				db
					.selectDistinct({ username: users.username })
					.from(cookbookEditors)
					.innerJoin(users, eq(users.id, cookbookEditors.userId))
					.where(inArray(cookbookEditors.cookbookId, ids))
			])
		: [[], []];

	return [
		...new Set([
			...LIST_PATHS,
			...recipes.flatMap(recipePaths),
			...books.map(({ owner, slug }) => `/@${owner}/${slug}`),
			...ids.map((id) => `/api/kochbuch/${id}/index.json`),
			...editors.map(({ username }) => `/@${username}`)
		])
	];
};
