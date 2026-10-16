import { count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { cookbooks, recipes, users } from '#lib/server/db/schema.js';
import { PAGE_SIZE, pageOffset, pagination, readPage } from '#lib/server/pagination.js';

export async function load({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
	const page = readPage(url);
	const where = query
		? or(ilike(cookbooks.name, pattern), ilike(users.username, pattern))
		: undefined;
	const db = getDb();
	const [rows, [{ total }]] = await Promise.all([
		db
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
			.where(where)
			.orderBy(desc(cookbooks.createdAt))
			.limit(PAGE_SIZE)
			.offset(pageOffset(page)),
		db
			.select({ total: count() })
			.from(cookbooks)
			.innerJoin(users, eq(users.id, cookbooks.ownerId))
			.where(where)
	]);
	return { query, cookbooks: rows, pagination: pagination(page, rows.length, total) };
}
