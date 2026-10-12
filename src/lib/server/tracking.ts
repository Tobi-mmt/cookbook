import { createHash, randomBytes } from 'node:crypto';
import { and, count, countDistinct, desc, gte, lt, lte, sql } from 'drizzle-orm';
import { isbot } from 'isbot';
import type { Database } from './db/client';
import { pageViews, trackingSalts } from './db/schema';

/**
 * Cookieless visitor counting like Plausible: a visitor is identified by a hash of
 * a random daily salt, the host, the IP and the user agent. The IP is never stored and
 * the salt is deleted after the day, so the hashes can no longer be linked to anybody.
 */

const TIME_ZONE = 'Europe/Berlin';

/** The day as `YYYY-MM-DD` in German time, so that the salt rotates at local midnight */
export const trackingDay = (now = new Date()) =>
	new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);

export const visitorHash = (salt: string, host: string, ip: string, userAgent: string) =>
	createHash('sha256')
		.update([salt, host, ip, userAgent].join('|'))
		.digest()
		.subarray(0, 16)
		.toString('base64url');

export const isBot = (userAgent: string | null) => !userAgent || isbot(userAgent);

const MAX_PATH_LENGTH = 200;

/** Returns the pathname of a public page or null, so that nobody can fill the table with junk */
export const normalizePath = (path: string) => {
	if (!path.startsWith('/') || path.startsWith('//')) return null;
	const { pathname } = new URL(path, 'http://localhost');
	if (pathname.length > MAX_PATH_LENGTH) return null;
	if (pathname !== '/' && !pathname.startsWith('/recipe/')) return null;
	return pathname;
};

let cachedSalt: { day: string; salt: string } | undefined;

/** Creates the salt of the day once (also across parallel instances) and deletes all older ones */
export const getDailySalt = async (db: Database, day: string) => {
	if (cachedSalt?.day === day) return cachedSalt.salt;

	const [created] = await db
		.insert(trackingSalts)
		.values({ day, salt: randomBytes(32).toString('base64') })
		.onConflictDoNothing()
		.returning();
	if (created) await db.delete(trackingSalts).where(lt(trackingSalts.day, day));

	const salt =
		created?.salt ??
		(await db.query.trackingSalts.findFirst({ where: (salts, { eq }) => eq(salts.day, day) }))!
			.salt;
	cachedSalt = { day, salt };
	return salt;
};

export const recordPageView = async (
	db: Database,
	{
		path,
		host,
		ip,
		userAgent,
		now = new Date()
	}: { path: string; host: string; ip: string; userAgent: string; now?: Date }
) => {
	const day = trackingDay(now);
	const salt = await getDailySalt(db, day);
	await db
		.insert(pageViews)
		.values({ day, path, visitorHash: visitorHash(salt, host, ip, userAgent) });
};

export type DailyStats = { day: string; visitors: number; pageViews: number };
export type PageStats = { path: string; visitors: number; pageViews: number };

const inRange = (from: string, to: string) => and(gte(pageViews.day, from), lte(pageViews.day, to));

/** Days without page views are not returned */
export const getDailyStats = (db: Database, from: string, to: string): Promise<DailyStats[]> =>
	db
		.select({
			day: pageViews.day,
			visitors: countDistinct(pageViews.visitorHash),
			pageViews: count()
		})
		.from(pageViews)
		.where(inRange(from, to))
		.groupBy(pageViews.day)
		.orderBy(pageViews.day);

/** Visitors of a page are unique per day, like the visitors of the whole site */
export const getPageStats = async (
	db: Database,
	from: string,
	to: string
): Promise<PageStats[]> => {
	const perDay = db
		.select({
			path: pageViews.path,
			visitors: countDistinct(pageViews.visitorHash).as('visitors'),
			pageViews: count().as('page_views')
		})
		.from(pageViews)
		.where(inRange(from, to))
		.groupBy(pageViews.day, pageViews.path)
		.as('per_day');

	const visitors = sql<number>`sum(${perDay.visitors})::int`;
	return db
		.select({
			path: perDay.path,
			visitors,
			pageViews: sql<number>`sum(${perDay.pageViews})::int`
		})
		.from(perDay)
		.groupBy(perDay.path)
		.orderBy(desc(visitors), perDay.path);
};
