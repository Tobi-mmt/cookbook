import { randomBytes } from 'node:crypto';
import { asc, eq, inArray } from 'drizzle-orm';
import type { Recipe, RecipeImage, RecipeIndexEntry } from '../../types';
import type { RecipeInput } from '../recipeInput';
import { sortRecipes } from '../sortRecipes';
import type { Database } from './db/client';
import { mapRecipe, mapRecipeInput, type RecipeRows } from './db/mapRecipe';
import { ingredients, recipes, stepIngredients, steps } from './db/schema';

/** 15 hex chars, same format as the former `yarn get-random-id` */
export const createRecipeId = () => randomBytes(8).toString('hex').slice(0, 15);

const loadRows = async (db: Database, recipeIds?: string[]): Promise<RecipeRows[]> => {
	const recipeRows = await db
		.select()
		.from(recipes)
		.where(recipeIds ? inArray(recipes.id, recipeIds) : undefined);
	if (!recipeRows.length) return [];

	const ids = recipeRows.map((row) => row.id);
	const [ingredientRows, stepRows] = await Promise.all([
		db.select().from(ingredients).where(inArray(ingredients.recipeId, ids)),
		db.select().from(steps).where(inArray(steps.recipeId, ids))
	]);
	const linkRows = stepRows.length
		? await db
				.select()
				.from(stepIngredients)
				.where(
					inArray(
						stepIngredients.stepId,
						stepRows.map((row) => row.id)
					)
				)
		: [];

	return recipeRows.map((recipe) => {
		const recipeSteps = stepRows.filter((row) => row.recipeId === recipe.id);
		const stepIds = new Set(recipeSteps.map((row) => row.id));
		return {
			recipe,
			ingredients: ingredientRows.filter((row) => row.recipeId === recipe.id),
			steps: recipeSteps,
			stepIngredients: linkRows.filter((row) => stepIds.has(row.stepId))
		};
	});
};

export const listRecipes = async (db: Database): Promise<Recipe[]> =>
	sortRecipes((await loadRows(db)).map(mapRecipe));

export const getRecipe = async (db: Database, id: string): Promise<Recipe | undefined> => {
	const [rows] = await loadRows(db, [id]);
	return rows && mapRecipe(rows);
};

export const getRecipeInput = async (db: Database, id: string) => {
	const [rows] = await loadRows(db, [id]);
	return rows && { input: mapRecipeInput(rows), image: rows.recipe.image };
};

/** Data for the menu and the search, kept small because it is loaded on every page */
export const listRecipeIndex = async (db: Database): Promise<RecipeIndexEntry[]> => {
	const [recipeRows, ingredientRows] = await Promise.all([
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
				category: recipe.category,
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
 * `image: undefined` keeps the current image.
 */
export const saveRecipe = async (
	db: Database,
	id: string,
	input: RecipeInput,
	image?: RecipeImage | null
) => {
	await db.transaction(async (tx) => {
		const values = {
			title: input.title,
			description: input.description || null,
			sourceUrl: input.sourceUrl || null,
			portion: input.portion,
			duration: input.duration,
			category: input.category,
			nutritionType: input.nutritionType,
			updatedAt: new Date(),
			...(image !== undefined ? { image } : {})
		};
		await tx
			.insert(recipes)
			.values({ id, ...values })
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
