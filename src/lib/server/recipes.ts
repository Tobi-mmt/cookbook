import { asc, eq, getTableColumns, inArray, type Column } from 'drizzle-orm';
import type { Recipe, RecipeImage, RecipeIndexEntry, RecipeSummary } from '../../types';
import { isNewRecipe } from '../newRecipe';
import type { RecipeInput } from '../recipeInput';
import { sortRecipes } from '../sortRecipes';
import { categoriesById } from './categories';
import type { Database } from './db/client';
import { mapRecipe, mapRecipeInput, type RecipeRows } from './db/mapRecipe';
import { ingredients, recipes, stepIngredients, steps } from './db/schema';

export { createId as createRecipeId } from './ids';

/** All queries run in parallel, so that a cold page render waits for only one database round trip */
const loadRows = async (db: Database, recipeIds?: string[]): Promise<RecipeRows[]> => {
	const ofRecipes = (column: Column) => (recipeIds ? inArray(column, recipeIds) : undefined);

	const [categoryMap, recipeRows, ingredientRows, stepRows, linkRows] = await Promise.all([
		categoriesById(db),
		db.select().from(recipes).where(ofRecipes(recipes.id)),
		db.select().from(ingredients).where(ofRecipes(ingredients.recipeId)),
		db.select().from(steps).where(ofRecipes(steps.recipeId)),
		db
			.select(getTableColumns(stepIngredients))
			.from(stepIngredients)
			.innerJoin(steps, eq(stepIngredients.stepId, steps.id))
			.where(ofRecipes(steps.recipeId))
	]);

	return recipeRows.map((recipe) => {
		const recipeSteps = stepRows.filter((row) => row.recipeId === recipe.id);
		const stepIds = new Set(recipeSteps.map((row) => row.id));
		return {
			recipe,
			category: categoryMap.get(recipe.categoryId)!,
			ingredients: ingredientRows.filter((row) => row.recipeId === recipe.id),
			steps: recipeSteps,
			stepIngredients: linkRows.filter((row) => stepIds.has(row.stepId))
		};
	});
};

export const getRecipe = async (db: Database, id: string): Promise<Recipe | undefined> => {
	const [rows] = await loadRows(db, [id]);
	return rows && mapRecipe(rows);
};

export const getRecipeInput = async (db: Database, id: string) => {
	const [rows] = await loadRows(db, [id]);
	return rows && { input: mapRecipeInput(rows), image: rows.recipe.image };
};

/** Data for the home page tiles, without ingredients and steps */
export const listRecipeSummaries = async (db: Database): Promise<RecipeSummary[]> => {
	const [categoryMap, recipeRows] = await Promise.all([
		categoriesById(db),
		db.select().from(recipes)
	]);
	return sortRecipes(
		recipeRows.map((recipe) => ({
			id: recipe.id,
			title: recipe.title,
			image: recipe.image,
			isNew: isNewRecipe(recipe.createdAt),
			meta: {
				portion: recipe.portion,
				duration: recipe.duration,
				category: categoryMap.get(recipe.categoryId)!,
				nutritionType: recipe.nutritionType
			}
		}))
	);
};

/** Data for the search, kept small because the browser loads it as a whole */
export const listRecipeIndex = async (db: Database): Promise<RecipeIndexEntry[]> => {
	const [categoryMap, recipeRows, ingredientRows] = await Promise.all([
		categoriesById(db),
		db.select().from(recipes),
		db
			.select({ recipeId: ingredients.recipeId, name: ingredients.name })
			.from(ingredients)
			.where(eq(ingredients.kind, 'ingredient'))
			.orderBy(asc(ingredients.position))
	]);
	return sortRecipes(
		recipeRows.map((recipe) => ({
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
 * Creates or replaces a recipe including all ingredients, steps and their links.
 * `image: undefined` keeps the current image, `cookbookId` is only used for new recipes.
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
	await db.transaction(async (tx) => {
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
	});
};

export const deleteRecipe = async (db: Database, id: string) => {
	await db.delete(recipes).where(eq(recipes.id, id));
};
