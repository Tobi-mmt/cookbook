import { eq, sql } from 'drizzle-orm';
import type { RecipeImage } from '../../types';
import type { Database } from './db/client';
import { recipes, recipeVersions, users } from './db/schema';

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
		if (!image) continue;
		const url = image.variants.webp[0]?.url ?? image.variants.avif[0]?.url;
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
