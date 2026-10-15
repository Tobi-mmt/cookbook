import { and, gte, inArray, isNull, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { mailLog, recipes, reportCases, users } from '#lib/server/db/schema.js';

const count = sql<number>`count(*)::int`;

export async function load() {
	const db = getDb();
	const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const month = new Date();
	month.setUTCDate(1);
	month.setUTCHours(0, 0, 0, 0);

	const [[cases], [people], [newRecipes], [mails], size, latestPeople] = await Promise.all([
		db
			.select({ count })
			.from(reportCases)
			.where(inArray(reportCases.status, ['open', 'in_review'])),
		db.select({ count }).from(users).where(gte(users.createdAt, week)),
		db
			.select({ count })
			.from(recipes)
			.where(and(gte(recipes.createdAt, week), isNull(recipes.deletedAt))),
		db.select({ count }).from(mailLog).where(gte(mailLog.createdAt, month)),
		db.execute<{ bytes: string }>(sql`select pg_database_size(current_database()) as bytes`),
		db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				createdAt: users.createdAt
			})
			.from(users)
			.orderBy(sql`${users.createdAt} desc`)
			.limit(5)
	]);
	return {
		openCases: cases.count,
		newPeople: people.count,
		newRecipes: newRecipes.count,
		mailsThisMonth: mails.count,
		databaseBytes: Number(size.rows[0]?.bytes ?? 0),
		latestPeople
	};
}
