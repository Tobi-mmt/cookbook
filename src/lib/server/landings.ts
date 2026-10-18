import { and, count, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { DIET_LANDINGS, ingredientSlug, type Landing } from '../landings';
import { listCategories } from './categories';
import type { Database } from './db/client';
import { cookbooks, ingredients, recipes } from './db/schema';
import { notAnUnchangedCopy } from './home';
import { indexableOwner } from './indexing';
import { isVisible, listRecipeSummaries } from './recipes';

const MAX_RECIPES = 120;
const MIN_INGREDIENT_RECIPES = 2;
const MAX_INGREDIENTS = 80;

/** Basics that are in almost every recipe, a page for them would help nobody */
const STAPLES = new Set([
	'salz',
	'pfeffer',
	'salz und pfeffer',
	'wasser',
	'öl',
	'olivenöl',
	'rapsöl',
	'sonnenblumenöl',
	'pflanzenöl',
	'zucker',
	'eis'
]);

const listed = () => and(isVisible, indexableOwner(), notAnUnchangedCopy);

const ingredientKey = sql<string>`lower(trim(regexp_replace(${ingredients.name}, '\\s*\\([^)]*\\)', '', 'g')))`;

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

/** The landing pages of categories and diets with at least one recipe */
export const listLandings = async (db: Database): Promise<Landing[]> => {
	const [categories, byCategory, byDiet] = await Promise.all([
		listCategories(db),
		countBy<number>(db, recipes.categoryId),
		countBy<string>(db, recipes.nutritionType)
	]);
	return [
		...categories.map(({ slug, name, id }) => ({
			kind: 'category' as const,
			slug,
			title: name,
			name,
			count: byCategory.get(id) ?? 0
		})),
		...DIET_LANDINGS.map(({ slug, title, nutritionType }) => ({
			kind: 'diet' as const,
			slug,
			title,
			name: nutritionType,
			count: byDiet.get(nutritionType) ?? 0
		}))
	].filter(({ count }) => count > 0);
};

/** Ingredients in at least two recipes, spelled as most recipes spell them */
export const listIngredientLandings = async (
	db: Database
): Promise<(Landing & { key: string })[]> => {
	const recipeCount = sql<number>`count(distinct ${ingredients.recipeId})::int`;
	const rows = await db
		.select({
			key: ingredientKey,
			name: sql<string>`mode() within group (order by trim(regexp_replace(${ingredients.name}, '\\s*\\([^)]*\\)', '', 'g')))`,
			count: recipeCount
		})
		.from(ingredients)
		.innerJoin(recipes, eq(recipes.id, ingredients.recipeId))
		.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
		.where(and(eq(ingredients.kind, 'ingredient'), listed()))
		.groupBy(ingredientKey)
		.having(sql`${recipeCount} >= ${MIN_INGREDIENT_RECIPES}`)
		.orderBy(sql`${recipeCount} desc`, ingredientKey)
		.limit(MAX_INGREDIENTS + STAPLES.size);

	const seen = new Set<string>();
	return rows
		.filter(({ key }) => key && !STAPLES.has(key))
		.map(({ key, name, count }) => ({
			kind: 'ingredient' as const,
			key,
			slug: ingredientSlug(key),
			title: `Rezepte mit ${name}`,
			name,
			count
		}))
		.filter(({ slug }) => slug && !seen.has(slug) && seen.add(slug))
		.slice(0, MAX_INGREDIENTS);
};

const listedRecipes = async (db: Database, where: SQL) => {
	const ids = (
		await db
			.select({ id: recipes.id })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(listed(), where))
			.orderBy(sql`${recipes.createdAt} desc`)
			.limit(MAX_RECIPES)
	).map(({ id }) => id);
	return ids.length ? await listRecipeSummaries(db, inArray(recipes.id, ids)) : [];
};

export const loadLanding = async (db: Database, slug: string) => {
	const landing = (await listLandings(db)).find((candidate) => candidate.slug === slug);
	if (!landing) return null;
	const diet = DIET_LANDINGS.find((candidate) => candidate.slug === slug);
	const categoryId = diet
		? undefined
		: (await listCategories(db)).find((category) => category.slug === slug)?.id;
	const where = diet
		? eq(recipes.nutritionType, diet.nutritionType)
		: eq(recipes.categoryId, categoryId!);
	return { ...landing, recipes: await listedRecipes(db, where) };
};

export const loadIngredientLanding = async (db: Database, slug: string) => {
	const landing = (await listIngredientLandings(db)).find((candidate) => candidate.slug === slug);
	if (!landing) return null;
	const { key, ...rest } = landing;
	const where = sql`exists (select 1 from ${ingredients} where ${ingredients.recipeId} = ${recipes.id} and ${ingredients.kind} = 'ingredient' and ${ingredientKey} = ${key})`;
	return { ...rest, recipes: await listedRecipes(db, where) };
};
