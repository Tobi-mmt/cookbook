import { getDb } from '#lib/server/context.js';
import { listRecipeIndex } from '#lib/server/recipes.js';
import { getBreakdown, getDailyStats, trackingDay } from '#lib/server/tracking.js';

const DEFAULT_DAYS = 30;
const RANGES = [7, 30, 90];
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const addDays = (day: string, days: number) => {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};

const daysBetween = (from: string, to: string) => {
	const days: string[] = [];
	for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
	return days;
};

const parseDay = (value: string | null) => (value && DAY_PATTERN.test(value) ? value : null);

export async function load({ url }) {
	const today = trackingDay();
	let to = parseDay(url.searchParams.get('to')) ?? today;
	let from = parseDay(url.searchParams.get('from')) ?? addDays(to, -(DEFAULT_DAYS - 1));
	if (from > to) [from, to] = [to, from];

	const db = getDb();
	const [dailyStats, pageStats, browsers, operatingSystems, recipes] = await Promise.all([
		getDailyStats(db, from, to),
		getBreakdown(db, 'path', from, to),
		getBreakdown(db, 'browser', from, to),
		getBreakdown(db, 'os', from, to),
		listRecipeIndex(db)
	]);

	const statsByDay = new Map(dailyStats.map((stats) => [stats.day, stats]));
	const titles = new Map(recipes.map(({ id, title }) => [id, title]));

	return {
		from,
		to,
		ranges: RANGES.map((days) => ({ days, from: addDays(today, -(days - 1)), to: today })),
		days: daysBetween(from, to).map(
			(day) => statsByDay.get(day) ?? { day, visitors: 0, pageViews: 0 }
		),
		pages: pageStats.map(({ value, ...stats }) => {
			const path = value ?? '/';
			return {
				...stats,
				path,
				title: path === '/' ? 'Startseite' : titles.get(path.split('/')[2])
			};
		}),
		browsers,
		operatingSystems
	};
}
