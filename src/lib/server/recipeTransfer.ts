import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { Database } from './db/client';
import { cookbooks, recipes } from './db/schema';
import { copyImage, imageFolder } from './images';
import { createRecipeId, getRecipeInput, saveRecipe } from './recipes';
import type { Storage } from './storage';

/**
 * An independent copy with its own images in another cookbook. It remembers the copy chain for
 * the attribution that CC BY-SA requires and stays an "unchanged copy" until it is saved again.
 */
export const copyRecipe = async (
	db: Database,
	storage: Storage,
	{ sourceId, cookbookId, userId }: { sourceId: string; cookbookId: string; userId: string }
) => {
	const [source, sourceRow] = await Promise.all([
		getRecipeInput(db, sourceId),
		db.query.recipes.findFirst({ where: eq(recipes.id, sourceId) })
	]);
	if (!source || !sourceRow) throw new Error(`Recipe ${sourceId} not found`);

	const id = createRecipeId();
	const image = source.image
		? {
				...(await copyImage(source.image, imageFolder(id), storage)),
				uploadedBy: userId
			}
		: null;
	await saveRecipe(db, id, source.input, { image, cookbookId, userId });
	await db
		.update(recipes)
		.set({
			copiedFromId: sourceId,
			attribution: [
				{ recipeId: sourceId, title: sourceRow.title, userId: sourceRow.createdBy },
				...sourceRow.attribution
			]
		})
		.where(eq(recipes.id, id));
	return { id, title: source.input.title };
};

/** The address of a recipe stays the same, it only appears in another cookbook */
export const moveRecipe = (db: Database, id: string, cookbookId: string) =>
	db.update(recipes).set({ cookbookId }).where(eq(recipes.id, id));

/** Copies of a recipe in the given cookbooks, so that nobody copies the same recipe twice */
export const findCopies = (db: Database, sourceId: string, cookbookIds: string[]) =>
	cookbookIds.length
		? db
				.select({
					id: recipes.id,
					title: recipes.title,
					cookbookId: recipes.cookbookId,
					cookbookName: cookbooks.name
				})
				.from(recipes)
				.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
				.where(
					and(
						eq(recipes.copiedFromId, sourceId),
						inArray(recipes.cookbookId, cookbookIds),
						isNull(recipes.deletedAt)
					)
				)
		: Promise.resolve([]);
