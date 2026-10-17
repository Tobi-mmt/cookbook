import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { DIET_LANDINGS, type Landing } from '../landings';
import { listCategories } from './categories';
import type { Database } from './db/client';
import { cookbooks, recipes } from './db/schema';
import { notAnUnchangedCopy } from './home';
import { isVisible, listRecipeSummaries } from './recipes';
import { indexableOwner } from './indexing';

const MAX_RECIPES = 120;

const listed = () => and(isVisible, indexableOwner(), notAnUnchangedCopy);

const countBy = async <T extends string | number>(
	db: Database,
	column: typeof recipes.categoryId | typeof recipes.nutritionType
) => {
	const rows = await db
		.select({ key: column, count: count() })
		.from(recipes)
		.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
		.where(listed())
		.groupBy(column);
	return new Map(rows.map(({ key, count }) => [key as T, count]));
};

/** The landing pages with at least one recipe: categories first, then diets */
export const listLandings = async (db: Database): Promise<Landing[]> => {
	const [categories, byCategory, byDiet] = await Promise.all([
		listCategories(db),
		countBy<number>(db, recipes.categoryId),
		countBy<string>(db, recipes.nutritionType)
	]);
	return [
		...categories.map(({ slug, name, id }) => ({
			slug,
			title: name,
			count: byCategory.get(id) ?? 0
		})),
		...DIET_LANDINGS.map(({ slug, title, nutritionType }) => ({
			slug,
			title,
			count: byDiet.get(nutritionType) ?? 0
		}))
	].filter(({ count }) => count > 0);
};

export const loadLanding = async (db: Database, slug: string) => {
	const diet = DIET_LANDINGS.find((landing) => landing.slug === slug);
	const category = diet ? undefined : (await listCategories(db)).find((c) => c.slug === slug);
	if (!diet && !category) return null;

	const ids = (
		await db
			.select({ id: recipes.id })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(
				and(
					listed(),
					diet
						? eq(recipes.nutritionType, diet.nutritionType)
						: eq(recipes.categoryId, category!.id)
				)
			)
			.orderBy(sql`${recipes.createdAt} desc`)
			.limit(MAX_RECIPES)
	).map(({ id }) => id);

	return {
		slug,
		title: diet?.title ?? category!.name,
		recipes: ids.length ? await listRecipeSummaries(db, inArray(recipes.id, ids)) : []
	};
};
