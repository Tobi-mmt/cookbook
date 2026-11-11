import { lt } from 'drizzle-orm';
import type { Database } from './db/client';
import { cookbookExports } from './db/schema';
import type { Storage } from './storage';

/**
 * Generated PDFs are deleted after this many days, a new one is created on the next request.
 * Kept apart from `cookbookPdf.ts`, so that the nightly job does not carry the Typst binary.
 */
const EXPORT_MAX_AGE_DAYS = 30;

/** For the nightly job */
export const deleteOldExports = async (db: Database, storage: Storage, now = new Date()) => {
	const before = new Date(now.getTime() - EXPORT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
	const deleted = await db
		.delete(cookbookExports)
		.where(lt(cookbookExports.createdAt, before))
		.returning({ url: cookbookExports.url });
	await storage.deleteFiles(deleted.map(({ url }) => url));
	return deleted.length;
};
