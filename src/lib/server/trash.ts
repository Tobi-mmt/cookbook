import { and, desc, eq, inArray, isNotNull, isNull, lt, or } from 'drizzle-orm';
import type { RecipeImage } from '../../types';
import type { Database } from './db/client';
import { cookbooks, recipes, recipeVersions, users } from './db/schema';
import type { Storage } from './storage';
import { deleteUnusedImages } from './versions';

export const TRASH_DAYS = 30;

export const trashCutoff = (now = new Date()) =>
	new Date(now.getTime() - TRASH_DAYS * 24 * 60 * 60 * 1000);

export const moveRecipeToTrash = (db: Database, id: string, userId: string) =>
	db.update(recipes).set({ deletedAt: new Date(), deletedBy: userId }).where(eq(recipes.id, id));

export const moveAllRecipesToTrash = (db: Database, cookbookId: string, userId: string) =>
	db
		.update(recipes)
		.set({ deletedAt: new Date(), deletedBy: userId })
		.where(and(eq(recipes.cookbookId, cookbookId), isNull(recipes.deletedAt)));

export const restoreRecipe = (db: Database, id: string) =>
	db.update(recipes).set({ deletedAt: null, deletedBy: null }).where(eq(recipes.id, id));

export const listTrash = (db: Database, cookbookId: string) =>
	db
		.select({
			id: recipes.id,
			title: recipes.title,
			deletedAt: recipes.deletedAt,
			deletedBy: users.name
		})
		.from(recipes)
		.leftJoin(users, eq(users.id, recipes.deletedBy))
		.where(and(eq(recipes.cookbookId, cookbookId), isNotNull(recipes.deletedAt)))
		.orderBy(desc(recipes.deletedAt));

/** Deletes recipes for good, together with their versions and images nobody shows anymore */
const purgeRecipes = async (db: Database, storage: Storage, ids: string[]) => {
	if (!ids.length) return;
	const [current, versions] = await Promise.all([
		db.select({ image: recipes.image }).from(recipes).where(inArray(recipes.id, ids)),
		db
			.select({ snapshot: recipeVersions.snapshot })
			.from(recipeVersions)
			.where(inArray(recipeVersions.recipeId, ids))
	]);
	const images: RecipeImage[] = [
		...current.flatMap(({ image }) => (image ? [image] : [])),
		...versions.flatMap(({ snapshot }) => (snapshot.image ? [snapshot.image] : []))
	];
	await db.delete(recipes).where(inArray(recipes.id, ids));
	await deleteUnusedImages(db, storage, images);
};

/** Empties the trash after 30 days, run by the daily job */
export const purgeTrash = async (db: Database, storage: Storage, now = new Date()) => {
	const cutoff = trashCutoff(now);
	const oldCookbooks = await db
		.select({ id: cookbooks.id })
		.from(cookbooks)
		.where(lt(cookbooks.deletedAt, cutoff));
	const cookbookIds = oldCookbooks.map(({ id }) => id);

	const oldRecipes = await db
		.select({ id: recipes.id })
		.from(recipes)
		.where(
			or(
				lt(recipes.deletedAt, cutoff),
				cookbookIds.length ? inArray(recipes.cookbookId, cookbookIds) : undefined
			)
		);
	await purgeRecipes(
		db,
		storage,
		oldRecipes.map(({ id }) => id)
	);
	if (cookbookIds.length) await db.delete(cookbooks).where(inArray(cookbooks.id, cookbookIds));
	return { recipes: oldRecipes.length, cookbooks: cookbookIds.length };
};
