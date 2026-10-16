import { count, desc, ilike, or } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { users } from '#lib/server/db/schema.js';
import { PAGE_SIZE, pageOffset, pagination, readPage } from '#lib/server/pagination.js';

export async function load({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
	const page = readPage(url);
	const where = query
		? or(ilike(users.name, pattern), ilike(users.username, pattern), ilike(users.email, pattern))
		: undefined;
	const db = getDb();
	const [people, [{ total }]] = await Promise.all([
		db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				role: users.role,
				banned: users.banned,
				createdAt: users.createdAt
			})
			.from(users)
			.where(where)
			.orderBy(desc(users.createdAt))
			.limit(PAGE_SIZE)
			.offset(pageOffset(page)),
		db.select({ total: count() }).from(users).where(where)
	]);
	return { query, people, pagination: pagination(page, people.length, total) };
}
