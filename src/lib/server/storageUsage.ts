import { eq, sql } from 'drizzle-orm';
import type { RecipeImage } from '../../types';
import type { Database } from './db/client';
import { recipes, recipeVersions, users } from './db/schema';
import { imageUrls } from './images';

const BACKFILL_BATCH = 100;

/**
 * The image storage of a person: every image they uploaded or copied, also in old versions and
 * in the trash, each counted once.
 */
export const storageUsage = async (db: Database, userId: string) => {
	const [current, versions] = await Promise.all([
		db
			.select({ image: recipes.image })
			.from(recipes)
			.where(sql`${recipes.image}->>'uploadedBy' = ${userId}`),
		db
			.select({ image: sql<RecipeImage>`${recipeVersions.snapshot}->'image'` })
			.from(recipeVersions)
			.where(sql`${recipeVersions.snapshot}->'image'->>'uploadedBy' = ${userId}`)
	]);
	const byUrl = new Map<string, number>();
	for (const { image } of [...current, ...versions]) {
		const url = image?.variants.avif[0]?.url;
		if (url) byUrl.set(url, image.bytes ?? 0);
	}
	return [...byUrl.values()].reduce((sum, bytes) => sum + bytes, 0);
};

export const storageStatus = async (db: Database, userId: string) => {
	const [used, user] = await Promise.all([
		storageUsage(db, userId),
		db.query.users.findFirst({ where: eq(users.id, userId), columns: { storageLimitBytes: true } })
	]);
	const limit = user?.storageLimitBytes ?? 0;
	return { used, limit, full: used >= limit };
};

const fileSize = async (url: string) => {
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`HEAD ${url} failed: ${response.status}`);
	return Number(response.headers.get('content-length') ?? 0);
};

const completeImage = async (
	image: RecipeImage,
	uploadedBy: string | null,
	size: (url: string) => Promise<number>
): Promise<RecipeImage> => ({
	...image,
	bytes:
		image.bytes ?? (await Promise.all(imageUrls(image).map(size))).reduce((sum, n) => sum + n, 0),
	...(!image.uploadedBy && uploadedBy && { uploadedBy })
});

/**
 * Images from before the storage limit carry neither size nor uploader, so they counted as 0 MB.
 * The nightly job completes a batch of them, a failing image is tried again the next night.
 */
export const backfillImageSizes = async (db: Database, size = fileSize) => {
	const incomplete = (image: unknown, author: unknown) =>
		sql`${image} is not null and (${image}->'bytes' is null or (${image}->>'uploadedBy' is null and ${author} is not null))`;
	const [current, versions] = await Promise.all([
		db
			.select({ id: recipes.id, image: recipes.image, author: recipes.createdBy })
			.from(recipes)
			.where(incomplete(recipes.image, recipes.createdBy))
			.limit(BACKFILL_BATCH),
		db
			.select({
				id: recipeVersions.id,
				image: sql<RecipeImage>`${recipeVersions.snapshot}->'image'`,
				author: recipeVersions.createdBy
			})
			.from(recipeVersions)
			.where(
				incomplete(
					sql`nullif(${recipeVersions.snapshot}->'image', 'null'::jsonb)`,
					recipeVersions.createdBy
				)
			)
			.limit(BACKFILL_BATCH)
	]);

	let completed = 0;
	for (const { id, image, author } of current) {
		try {
			const full = await completeImage(image!, author, size);
			await db.update(recipes).set({ image: full }).where(eq(recipes.id, id));
			completed++;
		} catch (error) {
			console.error(`Image size of recipe ${id} unknown`, error);
		}
	}
	for (const { id, image, author } of versions) {
		try {
			const full = await completeImage(image, author, size);
			await db
				.update(recipeVersions)
				.set({
					snapshot: sql`jsonb_set(${recipeVersions.snapshot}, '{image}', ${JSON.stringify(full)}::jsonb)`
				})
				.where(eq(recipeVersions.id, id));
			completed++;
		} catch (error) {
			console.error(`Image size of version ${id} unknown`, error);
		}
	}
	return completed;
};
