import { and, count, countDistinct, desc, gte, inArray, lte, sql } from 'drizzle-orm';
import { SITE_DOMAIN, SITE_NAME, SUPPORT_MAILBOX } from '../site';
import type { Database } from './db/client';
import { pageViews, recipes, users } from './db/schema';
import { renderMail, sendMail } from './mail';
import { hitRateLimit } from './rateLimit';
import { addDays } from './recipeViews';
import { trackingDay } from './tracking';

const TOP_PATHS = 5;

export type Week = { from: string; to: string };

/** The last full week from Monday to Sunday in German time, and the week before */
export const lastWeeks = (now = new Date()) => {
	const today = trackingDay(now);
	const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
	const monday = addDays(today, -weekday - 7);
	return {
		current: { from: monday, to: addDays(monday, 6) },
		previous: { from: addDays(monday, -7), to: addDays(monday, -1) }
	};
};

const germanDay = (column: typeof users.createdAt | typeof recipes.createdAt) =>
	sql`(${column} at time zone 'Europe/Berlin')::date`;

const measureWeek = async (db: Database, { from, to }: Week) => {
	const inWeek = and(gte(pageViews.day, from), lte(pageViews.day, to));
	const perDay = db
		.select({ visitors: countDistinct(pageViews.visitorHash).as('visitors') })
		.from(pageViews)
		.where(inWeek)
		.groupBy(pageViews.day)
		.as('per_day');
	const [[accounts], [newRecipes], [views], [visitors]] = await Promise.all([
		db
			.select({ count: count() })
			.from(users)
			.where(sql`${germanDay(users.createdAt)} between ${from} and ${to}`),
		db
			.select({ count: count() })
			.from(recipes)
			.where(sql`${germanDay(recipes.createdAt)} between ${from} and ${to}`),
		db.select({ count: count() }).from(pageViews).where(inWeek),
		db.select({ count: sql<number>`coalesce(sum(${perDay.visitors}), 0)::int` }).from(perDay)
	]);
	return {
		accounts: accounts.count,
		recipes: newRecipes.count,
		pageViews: views.count,
		visitors: visitors.count
	};
};

const topPaths = async (db: Database, { from, to }: Week) => {
	const views = sql<number>`count(*)::int`;
	const rows = await db
		.select({ path: pageViews.path, views })
		.from(pageViews)
		.where(and(gte(pageViews.day, from), lte(pageViews.day, to)))
		.groupBy(pageViews.path)
		.orderBy(desc(views), pageViews.path)
		.limit(TOP_PATHS);
	const ids = rows.flatMap(({ path }) => path.match(/^\/(?:rezept|recipe)\/([^/]+)/)?.[1] ?? []);
	const titles = new Map(
		ids.length
			? (
					await db
						.select({ id: recipes.id, title: recipes.title })
						.from(recipes)
						.where(inArray(recipes.id, ids))
				).map(({ id, title }) => [id, title])
			: []
	);
	return rows.map(({ path, views }) => {
		const id = path.match(/^\/(?:rezept|recipe)\/([^/]+)/)?.[1];
		return { path, views, title: path === '/' ? 'Startseite' : id ? titles.get(id) : undefined };
	});
};

export const buildWeeklyReport = async (db: Database, now = new Date()) => {
	const { current, previous } = lastWeeks(now);
	const [thisWeek, lastWeek, top] = await Promise.all([
		measureWeek(db, current),
		measureWeek(db, previous),
		topPaths(db, current)
	]);
	return { current, previous, thisWeek, lastWeek, top };
};

const formatDay = (day: string) =>
	new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'numeric', timeZone: 'UTC' }).format(
		new Date(`${day}T00:00:00Z`)
	);

export const compare = (value: number, before: number) => {
	const difference = value - before;
	const percent = before
		? ` bzw. ${difference >= 0 ? '+' : ''}${Math.round((difference / before) * 100)} %`
		: '';
	return `${value.toLocaleString('de-DE')} (Vorwoche ${before.toLocaleString('de-DE')}, ${difference >= 0 ? '+' : ''}${difference.toLocaleString('de-DE')}${percent})`;
};

export const renderWeeklyReport = (
	report: Awaited<ReturnType<typeof buildWeeklyReport>>,
	origin: string
) => {
	const { current, thisWeek, lastWeek, top } = report;
	const range = `${formatDay(current.from)} bis ${formatDay(current.to)}`;
	return renderMail({
		subject: `${SITE_NAME}: Wochenbericht ${range}`,
		paragraphs: [
			`Die Woche vom ${range} im Vergleich zur Vorwoche:`,
			[
				`Neue Konten: ${compare(thisWeek.accounts, lastWeek.accounts)}`,
				`Neue Rezepte: ${compare(thisWeek.recipes, lastWeek.recipes)}`,
				`Seitenaufrufe: ${compare(thisWeek.pageViews, lastWeek.pageViews)}`,
				`Besucher: ${compare(thisWeek.visitors, lastWeek.visitors)}`
			].join('\n'),
			top.length
				? `Die meistbesuchten Seiten:\n${top
						.map(
							({ path, views, title }, index) =>
								`${index + 1}. ${title ? `${title} (${path})` : path}: ${views.toLocaleString('de-DE')} Aufrufe`
						)
						.join('\n')}`
				: 'In dieser Woche gab es keine Seitenaufrufe.'
		],
		button: { label: 'Zur Statistik', url: `${origin}/admin/stats` }
	});
};

/** On Mondays the report of the last week goes to the address of the site, once per week */
export const sendWeeklyReport = async (db: Database, origin: string, now = new Date()) => {
	const today = trackingDay(now);
	if (new Date(`${today}T00:00:00Z`).getUTCDay() !== 1) return 'not monday';
	const { current } = lastWeeks(now);
	if (!(await hitRateLimit(db, `weekly-report:${current.from}`, 1, 8 * 24 * 60 * 60))) {
		return 'already sent';
	}
	const report = await buildWeeklyReport(db, now);
	await sendMail(db, `${SUPPORT_MAILBOX}@${SITE_DOMAIN}`, renderWeeklyReport(report, origin), {
		kind: 'weekly-report',
		retry: true
	});
	return 'sent';
};
