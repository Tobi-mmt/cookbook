import { sql } from 'drizzle-orm';
import { cookbooks, users } from './db/schema';

/** New accounts are only indexed after two weeks, against spam */
export const INDEXING_DELAY = 14 * 24 * 60 * 60 * 1000;

/** Recipes of these owners appear in sitemaps, on the landing pages and in llms.txt */
export const indexableOwner = (now = new Date()) =>
	sql`${cookbooks.ownerId} in (select ${users.id} from ${users} where ${users.banned} = false and ${users.createdAt} < ${new Date(now.getTime() - INDEXING_DELAY)})`;
