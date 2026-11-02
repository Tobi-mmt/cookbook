import { and, count, countDistinct, desc, gte, inArray, lte, sql } from 'drizzle-orm';
import { SITE_DOMAIN, SUPPORT_MAILBOX } from '../site';
import type { Database } from './db/client';
import { pageViews, recipes, users } from './db/schema';
import { escapeHtml, renderMail, sendMail } from './mail';
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

const formatDay = (day: string, month = false) =>
	new Intl.DateTimeFormat('de-DE', {
		day: 'numeric',
		...(month && { month: 'numeric' }),
		timeZone: 'UTC'
	}).format(new Date(`${day}T00:00:00Z`));

const number = (value: number) => value.toLocaleString('de-DE');

/** "+22 %", "−50 %", "±0" or "neu" when there was nothing the week before */
export const change = (value: number, before: number) => {
	if (value === before) return { label: '±0', tone: 'same' as const };
	if (!before) return { label: 'neu', tone: 'up' as const };
	const percent = Math.round(((value - before) / before) * 100);
	return {
		label: `${percent > 0 ? '+' : '−'}${Math.abs(percent)} %`,
		tone: value > before ? ('up' as const) : ('down' as const)
	};
};

/** A readable name for a page of the statistics */
export const pageLabel = (path: string, title?: string) => {
	if (title) return title;
	if (path === '/') return 'Startseite';
	if (path === '/rezepte') return 'Rezepte nach Kategorie';
	if (path === '/ueber') return 'Über die Kochbuchbande';
	if (path === '/kosten') return 'Betriebskosten';
	if (path === '/suche') return 'Suche';
	const words = (slug: string) => decodeURIComponent(slug).replace(/-/g, ' ');
	const ingredient = path.match(/^\/rezepte\/mit\/([^/]+)$/)?.[1];
	if (ingredient) return `Rezepte mit ${words(ingredient).replace(/^./, (c) => c.toUpperCase())}`;
	const landing = path.match(/^\/rezepte\/([^/]+)$/)?.[1];
	if (landing) return words(landing).replace(/^./, (c) => c.toUpperCase());
	if (path.startsWith('/@')) return decodeURIComponent(path.slice(1));
	return path;
};

const TONE_COLORS = { up: '#2e7d32', down: '#c62828', same: '#888888' };
const cell = 'padding:10px 0;border-top:1px solid #eeeeee';

export const renderWeeklyReport = (
	report: Awaited<ReturnType<typeof buildWeeklyReport>>,
	origin: string
) => {
	const { current, thisWeek, lastWeek, top } = report;
	const range = `${formatDay(current.from)}.–${formatDay(current.to, true)}`;
	const rows = [
		['Besucher', thisWeek.visitors, lastWeek.visitors],
		['Seitenaufrufe', thisWeek.pageViews, lastWeek.pageViews],
		['Neue Konten', thisWeek.accounts, lastWeek.accounts],
		['Neue Rezepte', thisWeek.recipes, lastWeek.recipes]
	] as const;
	const visitors = change(thisWeek.visitors, lastWeek.visitors);

	const numbers = {
		html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 32px;font-size:15px">
<tr style="color:#888888;font-size:13px"><td style="padding:0 0 6px"></td><td align="right" style="padding:0 0 6px">Diese Woche</td><td align="right" style="padding:0 0 6px">Vorwoche</td><td align="right" style="padding:0 0 6px"></td></tr>
${rows
	.map(([label, value, before]) => {
		const { label: difference, tone } = change(value, before);
		return `<tr><td style="${cell}">${label}</td><td align="right" style="${cell};font-size:20px">${number(value)}</td><td align="right" style="${cell};color:#888888">${number(before)}</td><td align="right" style="${cell};width:64px;color:${TONE_COLORS[tone]}">${difference}</td></tr>`;
	})
	.join('\n')}
</table>`,
		text: [
			'Diese Woche (Vorwoche, Veränderung)',
			...rows.map(
				([label, value, before]) =>
					`${label}: ${number(value)} (${number(before)}, ${change(value, before).label})`
			)
		].join('\n')
	};

	const pages = top.length
		? {
				html: `<p style="margin:0 0 8px;font-size:13px;color:#888888">Meistbesuchte Seiten</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 8px;font-size:15px">
${top
	.map(
		({ path, views, title }, index) =>
			`<tr><td style="${cell};width:24px;color:#888888">${index + 1}.</td><td style="${cell}"><a href="${escapeHtml(origin + path)}" style="color:#222222;text-decoration:none">${escapeHtml(pageLabel(path, title))}</a></td><td align="right" style="${cell};color:#888888">${number(views)}</td></tr>`
	)
	.join('\n')}
</table>`,
				text: [
					'Meistbesuchte Seiten',
					...top.map(
						({ path, views, title }, index) =>
							`${index + 1}. ${pageLabel(path, title)}: ${number(views)}`
					)
				].join('\n')
			}
		: { html: '', text: 'In dieser Woche gab es keine Seitenaufrufe.' };

	return renderMail({
		subject: `Wochenbericht ${range}: ${number(thisWeek.visitors)} Besucher (${visitors.label})`,
		paragraphs: [`Wochenbericht vom ${range}`],
		blocks: [numbers, pages],
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
