import { sql } from 'drizzle-orm';
import type { Database } from './db/client';
import { rateLimits } from './db/schema';

/** Counts a hit and returns false once more than `limit` hits fall into the current window */
export const hitRateLimit = async (
	db: Database,
	key: string,
	limit: number,
	windowSeconds: number,
	now = new Date()
) => {
	const resetAt = new Date(now.getTime() + windowSeconds * 1000);
	const [row] = await db
		.insert(rateLimits)
		.values({ key, count: 1, resetAt })
		.onConflictDoUpdate({
			target: rateLimits.key,
			set: {
				count: sql`case when ${rateLimits.resetAt} <= ${now} then 1 else ${rateLimits.count} + 1 end`,
				resetAt: sql`case when ${rateLimits.resetAt} <= ${now} then ${resetAt} else ${rateLimits.resetAt} end`
			}
		})
		.returning({ count: rateLimits.count });
	return row.count <= limit;
};

export const deleteExpiredRateLimits = (db: Database, now = new Date()) =>
	db.delete(rateLimits).where(sql`${rateLimits.resetAt} < ${now}`);
