import { desc, eq, ilike, or, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { cookbooks, recipes, users } from '#lib/server/db/schema.js';

export async function load({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
	const rows = await getDb()
		.select({
			id: cookbooks.id,
			name: cookbooks.name,
			slug: cookbooks.slug,
			owner: users.username,
			hidden: sql<boolean>`${cookbooks.hiddenAt} is not null`,
			deleted: sql<boolean>`${cookbooks.deletedAt} is not null`,
			recipes: sql<number>`(select count(*)::int from ${recipes} where ${recipes.cookbookId} = ${cookbooks.id} and ${recipes.deletedAt} is null)`
		})
		.from(cookbooks)
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(query ? or(ilike(cookbooks.name, pattern), ilike(users.username, pattern)) : undefined)
		.orderBy(desc(cookbooks.createdAt))
		.limit(100);
	return { query, cookbooks: rows };
}
