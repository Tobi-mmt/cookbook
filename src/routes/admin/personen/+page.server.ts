import { desc, ilike, or } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { users } from '#lib/server/db/schema.js';

export async function load({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
	const people = await getDb()
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
		.where(
			query
				? or(
						ilike(users.name, pattern),
						ilike(users.username, pattern),
						ilike(users.email, pattern)
					)
				: undefined
		)
		.orderBy(desc(users.createdAt))
		.limit(100);
	return { query, people };
}
