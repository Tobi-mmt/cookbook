import { list } from '@vercel/blob';
import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
import type { Database } from './db/client';
import { cookbooks, mailLog, recipes, users } from './db/schema';

const GB = 1024 * 1024 * 1024;

/** Free limits of the services, checked on the pricing pages in October 2026 */
export const LIMITS = {
	databaseBytes: GB,
	blobBytes: GB,
	freeMailsPerMonth: 300
};

const blobBytes = async () => {
	if (!BLOB_READ_WRITE_TOKEN) return null;
	let bytes = 0;
	let cursor: string | undefined;
	do {
		const page = await list({ token: BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 });
		bytes += page.blobs.reduce((sum, { size }) => sum + size, 0);
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);
	return bytes;
};

/** What can be measured from within the app, the rest only shows in the dashboards */
export const measureUsage = async (db: Database, now = new Date()) => {
	const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	const [database, blob, [mails], [recipeCount], [cookbookCount], [accountCount]] =
		await Promise.all([
			db.execute<{ bytes: string }>(sql`select pg_database_size(current_database()) as bytes`),
			blobBytes().catch((error) => {
				console.error('Measuring the Blob store failed', error);
				return null;
			}),
			db
				.select({ count: count() })
				.from(mailLog)
				.where(and(eq(mailLog.status, 'sent'), gte(mailLog.createdAt, monthStart))),
			db.select({ count: count() }).from(recipes).where(isNull(recipes.deletedAt)),
			db.select({ count: count() }).from(cookbooks).where(isNull(cookbooks.deletedAt)),
			db.select({ count: count() }).from(users)
		]);
	return {
		databaseBytes: Number(database.rows[0]?.bytes ?? 0),
		blobBytes: blob,
		mailsThisMonth: mails.count,
		recipes: recipeCount.count,
		cookbooks: cookbookCount.count,
		accounts: accountCount.count,
		measuredAt: now.toISOString()
	};
};

export type Usage = Awaited<ReturnType<typeof measureUsage>>;
