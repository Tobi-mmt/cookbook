import { and, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import type { Database } from './db/client';
import { pageViews, recipeDailyViews, recipes } from './db/schema';

const RAW_DATA_MONTHS = 30;

export const addDays = (day: string, days: number) => {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};

/** Counts the views of one day per recipe, also under the former /recipe/ paths */
export const aggregateDailyViews = (db: Database, day: string) =>
	db.execute(sql`
		insert into ${recipeDailyViews} (recipe_id, day, visitors, views)
		select split_part(${pageViews.path}, '/', 3), ${pageViews.day}, count(distinct ${pageViews.visitorHash}), count(*)
		from ${pageViews}
		where ${pageViews.day} = ${day}
			and (${pageViews.path} like '/rezept/%' or ${pageViews.path} like '/recipe/%')
			and split_part(${pageViews.path}, '/', 3) in (select ${recipes.id} from ${recipes})
		group by 1, 2
		on conflict (recipe_id, day) do update set visitors = excluded.visitors, views = excluded.views`);

/** The raw page views are kept for 30 months, the daily numbers per recipe forever */
export const deleteOldPageViews = (db: Database, now = new Date()) => {
	const cutoff = new Date(now);
	cutoff.setMonth(cutoff.getMonth() - RAW_DATA_MONTHS);
	return db.delete(pageViews).where(lt(pageViews.day, cutoff.toISOString().slice(0, 10)));
};

/** Recipe ids by visitors in the given days, the most visited first */
export const mostVisitedRecipeIds = async (db: Database, from: string) =>
	(
		await db
			.select({ recipeId: recipeDailyViews.recipeId })
			.from(recipeDailyViews)
			.where(gte(recipeDailyViews.day, from))
			.groupBy(recipeDailyViews.recipeId)
			.orderBy(desc(sql`sum(${recipeDailyViews.visitors})`))
	).map(({ recipeId }) => recipeId);

/** Visitors and views per recipe and per day of a cookbook, for its statistics */
export const cookbookStats = async (db: Database, cookbookId: string, from: string) => {
	const inCookbook = and(
		gte(recipeDailyViews.day, from),
		inArray(
			recipeDailyViews.recipeId,
			db.select({ id: recipes.id }).from(recipes).where(eq(recipes.cookbookId, cookbookId))
		)
	);
	const visitors = sql<number>`sum(${recipeDailyViews.visitors})::int`;
	const [perRecipe, perDay] = await Promise.all([
		db
			.select({
				recipeId: recipeDailyViews.recipeId,
				title: recipes.title,
				visitors,
				views: sql<number>`sum(${recipeDailyViews.views})::int`
			})
			.from(recipeDailyViews)
			.innerJoin(recipes, eq(recipes.id, recipeDailyViews.recipeId))
			.where(inCookbook)
			.groupBy(recipeDailyViews.recipeId, recipes.title)
			.orderBy(desc(visitors)),
		db
			.select({ day: recipeDailyViews.day, visitors })
			.from(recipeDailyViews)
			.where(inCookbook)
			.groupBy(recipeDailyViews.day)
			.orderBy(recipeDailyViews.day)
	]);
	return { perRecipe, perDay };
};
