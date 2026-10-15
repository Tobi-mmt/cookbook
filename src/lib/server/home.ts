import { and, desc, inArray, isNotNull, lt, or, sql } from 'drizzle-orm';
import type { RecipeSummary } from '../../types';
import type { Database } from './db/client';
import { recipes, users } from './db/schema';
import { listRecipeSummaries } from './recipes';
import { addDays, mostVisitedRecipeIds } from './recipeViews';
import { trackingDay } from './tracking';

const TILES = 12;
const NEW_ACCOUNT_MONTHS = 6;

/** Unchanged copies only show up through their original, otherwise a recipe would appear twice */
const notAnUnchangedCopy = or(sql`${recipes.copiedFromId} is null`, sql`${recipes.version} > 1`);

const byIds = (summaries: RecipeSummary[], ids: string[]) => {
	const byId = new Map(summaries.map((summary) => [summary.id, summary]));
	return ids.flatMap((id) => byId.get(id) ?? []);
};

/** "Beliebt": most visitors of the last 30 days, filled up with the newest while data is scarce */
const popular = async (db: Database, newest: RecipeSummary[]) => {
	const ids = (await mostVisitedRecipeIds(db, addDays(trackingDay(), -30))).slice(0, TILES * 2);
	const visited = ids.length
		? byIds(await listRecipeSummaries(db, and(inArray(recipes.id, ids), notAnUnchangedCopy)), ids)
		: [];
	const fill = newest.filter(({ id }) => !visited.some((recipe) => recipe.id === id));
	return [...visited, ...fill].slice(0, TILES);
};

/** "Neu": the newest recipes with a photo, of accounts older than six months */
const fresh = async (db: Database) => {
	const accountsBefore = new Date();
	accountsBefore.setMonth(accountsBefore.getMonth() - NEW_ACCOUNT_MONTHS);
	const ids = (
		await db
			.select({ id: recipes.id })
			.from(recipes)
			.innerJoin(users, sql`${users.id} = ${recipes.createdBy}`)
			.where(and(isNotNull(recipes.image), lt(users.createdAt, accountsBefore), notAnUnchangedCopy))
			.orderBy(desc(recipes.createdAt))
			.limit(TILES * 2)
	).map(({ id }) => id);
	return ids.length
		? byIds(await listRecipeSummaries(db, inArray(recipes.id, ids)), ids).slice(0, TILES)
		: [];
};

const newestIds = async (db: Database) =>
	(
		await db
			.select({ id: recipes.id })
			.from(recipes)
			.where(notAnUnchangedCopy)
			.orderBy(desc(recipes.createdAt))
			.limit(TILES * 2)
	).map(({ id }) => id);

export const loadHome = async (db: Database) => {
	const ids = await newestIds(db);
	const newest = ids.length
		? byIds(await listRecipeSummaries(db, inArray(recipes.id, ids)), ids)
		: [];
	const [popularRecipes, newRecipes] = await Promise.all([popular(db, newest), fresh(db)]);
	return { popular: popularRecipes, fresh: newRecipes };
};
