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

const ingredientName = sql<string>`trim(regexp_replace(regexp_replace(${ingredients.name}, '\\s*\\([^)]*\\)', '', 'g'), '\\s*,.*$', ''))`;
/**
 * Every word through the German stemmer of Postgres (Tomaten, Äpfel, Champignons), plurals on
 * "-ln" and "-rn" that it keeps (Zwiebeln, Kartoffeln) additionally lose their "n"
 */
const ingredientKey = sql<string>`(
	select string_agg(regexp_replace(coalesce((ts_lexize('german_stem', word))[1], word), '([lr])n$', '\\1'), ' ' order by position)
	from unnest(regexp_split_to_array(lower(${ingredientName}), '[^[:alpha:]]+')) with ordinality as words(word, position)
	where word <> ''
)`;

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
/**
 * Ingredients in at least two recipes. Singular and plural share a page ("Zwiebel" and "Zwiebeln"),
 * named after the longest spelling, which is the plural if any recipe uses it.
 */
export const listIngredientLandings = async (
	db: Database
): Promise<(Landing & { key: string })[]> => {
	const recipeCount = sql<number>`count(distinct ${ingredients.recipeId})::int`;
	const from = () =>
		db
			.select({ key: ingredientKey, name: ingredientName, count: recipeCount })
			.from(ingredients)
			.innerJoin(recipes, eq(recipes.id, ingredients.recipeId))
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(eq(ingredients.kind, 'ingredient'), listed()));
	const [keys, spellings] = await Promise.all([
		db
			.select({ key: ingredientKey, count: recipeCount })
			.from(ingredients)
			.innerJoin(recipes, eq(recipes.id, ingredients.recipeId))
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(eq(ingredients.kind, 'ingredient'), listed()))
			.groupBy(ingredientKey)
			.having(sql`${recipeCount} >= ${MIN_INGREDIENT_RECIPES}`)
			.orderBy(sql`${recipeCount} desc`, ingredientKey)
			.limit(MAX_INGREDIENTS + STAPLES.size),
		from().groupBy(ingredientKey, ingredientName)
	]);

	const nameOf = (key: string) =>
		spellings
			.filter((spelling) => spelling.key === key)
			.sort(
				(a, b) =>
					b.name.length - a.name.length ||
					Number(b.name.toLowerCase() !== key) - Number(a.name.toLowerCase() !== key) ||
					b.count - a.count
			)[0]?.name ?? key;

	const seen = new Set<string>();
	return keys
		.map(({ key, count }) => ({ key, count, name: nameOf(key) }))
		.filter(({ key, name }) => key && !STAPLES.has(name.toLowerCase()))
		.map(({ key, count, name }) => {
			return {
				kind: 'ingredient' as const,
				key,
				slug: ingredientSlug(name),
				title: `Rezepte mit ${name}`,
				name,
				count
			};
		})
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

const allLandings = async (db: Database): Promise<Landing[]> => {
	const [landings, ingredientLandings] = await Promise.all([
		listLandings(db),
		listIngredientLandings(db)
	]);
	return [
		...landings,
		...ingredientLandings.map(({ kind, slug, title, name, count }) => ({
			kind,
			slug,
			title,
			name,
			count
		}))
	];
};

/** 1 for equal words, lower the more letters are missing, added, changed or swapped */
export const similarity = (a: string, b: string) => {
	const distance: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
		Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
	);
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			distance[i][j] = Math.min(
				distance[i - 1][j] + 1,
				distance[i][j - 1] + 1,
				distance[i - 1][j - 1] + cost
			);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				distance[i][j] = Math.min(distance[i][j], distance[i - 2][j - 2] + 1);
			}
		}
	}
	return 1 - distance[a.length][b.length] / Math.max(a.length, b.length, 1);
};

const MIN_SIMILARITY = 0.6;

/** Landing pages that fit a search, the best first */
export const searchLandings = async (db: Database, query: string, limit = 3) => {
	const term = ingredientSlug(query.trim().slice(0, 100));
	if (term.length < 3) return [];
	return (await allLandings(db))
		.map((landing) => {
			const name = ingredientSlug(landing.name);
			const prefix = name.startsWith(term) || term.startsWith(name);
			return { landing, score: prefix ? 1 : similarity(term, name) };
		})
		.filter(({ score }) => score >= MIN_SIMILARITY)
		.sort((a, b) => b.score - a.score || b.landing.count - a.landing.count)
		.slice(0, limit)
		.map(({ landing }) => landing);
};
