import {
	and,
	asc,
	eq,
	getTableColumns,
	inArray,
	isNull,
	sql,
	type Column,
	type SQL
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type {
	Category,
	CookbookRef,
	PersonRef,
	RecipeImage,
	RecipeIndexEntry,
	RecipeSummary
} from '../../types';
import { isNewRecipe } from '../newRecipe';
import type { RecipeInput } from '../recipeInput';
import { sortRecipes } from '../sortRecipes';
import { categoriesById } from './categories';
import type { Database } from './db/client';
import { mapRecipe, mapRecipeInput, type RecipeRows } from './db/mapRecipe';
import { cookbooks, ingredients, recipes, stepIngredients, steps, users } from './db/schema';
import { pruneVersions, recordVersion } from './versions';

export { createId as createRecipeId } from './ids';

const owners = alias(users, 'owners');
const authors = alias(users, 'authors');

/** Public pages show neither deleted nor hidden recipes, nor recipes of hidden cookbooks */
export const isVisible = and(
	isNull(recipes.deletedAt),
	isNull(recipes.hiddenAt),
	isNull(cookbooks.deletedAt),
	isNull(cookbooks.hiddenAt)
);

const person = (username: string | null, name: string | null): PersonRef | null =>
	username && name ? { username, name } : null;

/** A recipe with its cookbook and author, the base of all recipe queries */
const selectRecipes = (db: Database) =>
	db
		.select({
			recipe: recipes,
			cookbook: { id: cookbooks.id, name: cookbooks.name, slug: cookbooks.slug },
			ownerUsername: owners.username,
			hiddenCookbook: sql<boolean>`${cookbooks.hiddenAt} is not null or ${cookbooks.deletedAt} is not null`,
			authorUsername: authors.username,
			authorName: authors.name
		})
		.from(recipes)
		.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
		.innerJoin(owners, eq(owners.id, cookbooks.ownerId))
		.leftJoin(authors, eq(authors.id, recipes.createdBy));

type RecipeContextRow = Awaited<ReturnType<ReturnType<typeof selectRecipes>['where']>>[number];

const toCookbookRef = (row: RecipeContextRow): CookbookRef => ({
	...row.cookbook,
	ownerUsername: row.ownerUsername ?? ''
});

/** Resolves the names in the copy chains, deleted accounts become null */
const resolveAttribution = async (db: Database, rows: RecipeContextRow[]) => {
	const entries = rows.flatMap(({ recipe }) => recipe.attribution);
	if (!entries.length) return () => [];
	const userIds = [...new Set(entries.flatMap(({ userId }) => (userId ? [userId] : [])))];
	const recipeIds = [...new Set(entries.map(({ recipeId }) => recipeId))];
	const [people, existing] = await Promise.all([
		userIds.length
			? db
					.select({ id: users.id, username: users.username, name: users.name })
					.from(users)
					.where(inArray(users.id, userIds))
			: [],
		db
			.select({ id: recipes.id })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(inArray(recipes.id, recipeIds), isVisible))
	]);
	const peopleById = new Map(people.map((row) => [row.id, person(row.username, row.name)]));
	const existingIds = new Set(existing.map(({ id }) => id));
	return (row: RecipeContextRow) =>
		row.recipe.attribution.map((entry) => ({
			recipeId: entry.recipeId,
			title: entry.title,
			author: (entry.userId && peopleById.get(entry.userId)) || null,
			exists: existingIds.has(entry.recipeId)
		}));
};

/** All queries run in parallel, so that a cold page render waits for one database round trip */
const loadRows = async (db: Database, recipeIds: string[]): Promise<RecipeRows[]> => {
	const ofRecipes = (column: Column) => inArray(column, recipeIds);

	const [categoryMap, recipeRows, ingredientRows, stepRows, linkRows] = await Promise.all([
		categoriesById(db),
		selectRecipes(db).where(ofRecipes(recipes.id)),
		db.select().from(ingredients).where(ofRecipes(ingredients.recipeId)),
		db.select().from(steps).where(ofRecipes(steps.recipeId)),
		db
			.select(getTableColumns(stepIngredients))
			.from(stepIngredients)
			.innerJoin(steps, eq(stepIngredients.stepId, steps.id))
			.where(ofRecipes(steps.recipeId))
	]);
	const attributionOf = await resolveAttribution(db, recipeRows);

	return recipeRows.map((row) => {
		const { recipe } = row;
		const recipeSteps = stepRows.filter((step) => step.recipeId === recipe.id);
		const stepIds = new Set(recipeSteps.map((step) => step.id));
		return {
			recipe,
			category: categoryMap.get(recipe.categoryId)!,
			ingredients: ingredientRows.filter((ingredient) => ingredient.recipeId === recipe.id),
			steps: recipeSteps,
			stepIngredients: linkRows.filter((link) => stepIds.has(link.stepId)),
			context: {
				cookbook: toCookbookRef(row),
				author: person(row.authorUsername, row.authorName),
				attribution: attributionOf(row),
				hiddenCookbook: row.hiddenCookbook
			}
		};
	});
};

/** Also returns deleted and hidden recipes, the callers decide who may see them */
export const getRecipe = async (db: Database, id: string) => {
	const [rows] = await loadRows(db, [id]);
	if (!rows) return undefined;
	return {
		recipe: mapRecipe(rows),
		cookbookId: rows.recipe.cookbookId,
		visible: !rows.recipe.deletedAt && !rows.recipe.hiddenAt && !rows.context.hiddenCookbook,
		hiddenReason: rows.recipe.hiddenReason,
		deletedAt: rows.recipe.deletedAt
	};
};

export const getRecipeInput = async (db: Database, id: string) => {
	const [rows] = await loadRows(db, [id]);
	return (
		rows && {
			input: mapRecipeInput(rows),
			image: rows.recipe.image,
			cookbookId: rows.recipe.cookbookId,
			version: rows.recipe.version
		}
	);
};

/** Data for the tiles, without ingredients and steps, only visible recipes */
export const listRecipeSummaries = async (db: Database, where?: SQL): Promise<RecipeSummary[]> => {
	const [categoryMap, rows] = await Promise.all([
		categoriesById(db),
		selectRecipes(db).where(and(isVisible, where))
	]);
	return sortRecipes(rows.map((row) => toSummary(row, categoryMap)));
};

export const toSummary = (
	{
		recipe,
		authorUsername,
		authorName
	}: Pick<RecipeContextRow, 'recipe' | 'authorUsername' | 'authorName'>,
	categoryMap: Map<number, Category>
): RecipeSummary => ({
	id: recipe.id,
	title: recipe.title,
	image: recipe.image,
	isNew: isNewRecipe(recipe.createdAt),
	cookbookId: recipe.cookbookId,
	author: person(authorUsername, authorName),
	meta: {
		portion: recipe.portion,
		duration: recipe.duration,
		category: categoryMap.get(recipe.categoryId)!,
		nutritionType: recipe.nutritionType
	}
});

/** Data for the search in the browser, kept small because it is loaded as a whole */
export const listRecipeIndex = async (db: Database, where?: SQL): Promise<RecipeIndexEntry[]> => {
	const [categoryMap, recipeRows] = await Promise.all([
		categoriesById(db),
		db
			.select({ recipe: recipes })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(isVisible, where))
	]);
	const ingredientRows = recipeRows.length
		? await db
				.select({ recipeId: ingredients.recipeId, name: ingredients.name })
				.from(ingredients)
				.where(
					and(
						eq(ingredients.kind, 'ingredient'),
						inArray(
							ingredients.recipeId,
							recipeRows.map(({ recipe }) => recipe.id)
						)
					)
				)
				.orderBy(asc(ingredients.position))
		: [];
	return sortRecipes(
		recipeRows.map(({ recipe }) => ({
			id: recipe.id,
			title: recipe.title,
			meta: {
				portion: recipe.portion,
				duration: recipe.duration,
				category: categoryMap.get(recipe.categoryId)!,
				nutritionType: recipe.nutritionType
			},
			ingredients: ingredientRows
				.filter((row) => row.recipeId === recipe.id)
				.map(({ name }) => ({ name }))
		}))
	);
};

export const getRecipeMeta = async (db: Database, id: string) => {
	const [row] = await db
		.select({ id: recipes.id, title: recipes.title, image: recipes.image })
		.from(recipes)
		.where(eq(recipes.id, id));
	return row;
};

/**
 * Creates or replaces a recipe including all ingredients, steps and their links and stores the
 * result as a new version. `image: undefined` keeps the current image, `cookbookId` is only used
 * for new recipes. Returns the new version and the images of versions that were pruned.
 */
export const saveRecipe = async (
	db: Database,
	id: string,
	input: RecipeInput,
	{
		image,
		cookbookId,
		userId
	}: { image?: RecipeImage | null; cookbookId: string; userId: string | null }
) => {
	const [previous] = await loadRows(db, [id]);

	return db.transaction(async (tx) => {
		const version = previous ? previous.recipe.version + 1 : 1;
		const values = {
			title: input.title,
			description: input.description || null,
			sourceUrl: input.sourceUrl || null,
			portion: input.portion,
			duration: input.duration,
			categoryId: input.categoryId,
			nutritionType: input.nutritionType,
			updatedAt: new Date(),
			updatedBy: userId,
			version,
			...(image !== undefined ? { image } : {})
		};
		await tx
			.insert(recipes)
			.values({ id, cookbookId, createdBy: userId, ...values })
			.onConflictDoUpdate({ target: recipes.id, set: values });
		// children are replaced as a whole, links are removed by the cascade
		await tx.delete(ingredients).where(eq(ingredients.recipeId, id));
		await tx.delete(steps).where(eq(steps.recipeId, id));

		const ingredientIds = new Map<string, number>();
		if (input.ingredients.length) {
			const inserted = await tx
				.insert(ingredients)
				.values(
					input.ingredients.map((ingredient, position) => ({
						recipeId: id,
						position,
						kind: ingredient.kind,
						name: ingredient.name,
						quantity: ingredient.kind === 'ingredient' ? (ingredient.quantity ?? null) : null,
						unit: ingredient.kind === 'ingredient' ? ingredient.unit || null : null
					}))
				)
				.returning({ id: ingredients.id, position: ingredients.position });
			for (const row of inserted) {
				ingredientIds.set(input.ingredients[row.position].clientId, row.id);
			}
		}

		const insertedSteps = await tx
			.insert(steps)
			.values(
				input.steps.map((step, position) => ({
					recipeId: id,
					position,
					kind: step.kind,
					text: step.text
				}))
			)
			.returning({ id: steps.id, position: steps.position });

		const links = insertedSteps.flatMap((row) => {
			const step = input.steps[row.position];
			if (step.kind !== 'step') return [];
			const seen = new Set<string>();
			return step.links
				.filter(({ ingredientId }) => !seen.has(ingredientId) && seen.add(ingredientId))
				.map((link, position) => ({
					stepId: row.id,
					ingredientId: ingredientIds.get(link.ingredientId)!,
					position,
					quantity: link.quantity ?? null
				}));
		});
		if (links.length) await tx.insert(stepIngredients).values(links);

		// recipes from before the history get their previous state as the first version
		if (previous) {
			await recordVersion(tx, {
				recipeId: id,
				version: previous.recipe.version,
				snapshot: { input: mapRecipeInput(previous), image: previous.recipe.image },
				createdBy: previous.recipe.updatedBy,
				createdAt: previous.recipe.updatedAt
			});
		}
		await recordVersion(tx, {
			recipeId: id,
			version,
			snapshot: { input, image: image === undefined ? (previous?.recipe.image ?? null) : image },
			createdBy: userId
		});
		return { version, prunedImages: await pruneVersions(tx, id) };
	});
};

export const deleteRecipe = async (db: Database, id: string) => {
	await db.delete(recipes).where(eq(recipes.id, id));
};
