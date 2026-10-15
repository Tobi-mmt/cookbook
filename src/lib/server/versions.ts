import { and, desc, eq, lt, sql } from 'drizzle-orm';
import type { RecipeImage } from '../../types';
import type { Database } from './db/client';
import { recipes, recipeVersions, users, type RecipeSnapshot } from './db/schema';
import { imageUrls } from './images';
import type { Storage } from './storage';

export const MAX_VERSIONS = 20;

type Executor = Database | Parameters<Parameters<Database['transaction']>[0]>[0];

export const recordVersion = async (
	db: Executor,
	values: {
		recipeId: string;
		version: number;
		snapshot: RecipeSnapshot;
		createdBy: string | null;
		createdAt?: Date;
	}
) => {
	await db.insert(recipeVersions).values(values).onConflictDoNothing();
};

/** Deletes all but the newest versions and returns the images of the deleted ones */
export const pruneVersions = async (db: Executor, recipeId: string, keep = MAX_VERSIONS) => {
	const [oldest] = await db
		.select({ version: recipeVersions.version })
		.from(recipeVersions)
		.where(eq(recipeVersions.recipeId, recipeId))
		.orderBy(desc(recipeVersions.version))
		.offset(keep - 1)
		.limit(1);
	if (!oldest) return [];
	const removed = await db
		.delete(recipeVersions)
		.where(and(eq(recipeVersions.recipeId, recipeId), lt(recipeVersions.version, oldest.version)))
		.returning({ snapshot: recipeVersions.snapshot });
	return removed.flatMap(({ snapshot }) => (snapshot.image ? [snapshot.image] : []));
};

export const listVersions = (db: Database, recipeId: string) =>
	db
		.select({
			version: recipeVersions.version,
			createdAt: recipeVersions.createdAt,
			author: users.name
		})
		.from(recipeVersions)
		.leftJoin(users, eq(users.id, recipeVersions.createdBy))
		.where(eq(recipeVersions.recipeId, recipeId))
		.orderBy(desc(recipeVersions.version));

export const getVersion = (db: Database, recipeId: string, version: number) =>
	db.query.recipeVersions.findFirst({
		where: and(eq(recipeVersions.recipeId, recipeId), eq(recipeVersions.version, version))
	});

/** An image is used as long as a recipe or one of the stored versions shows it */
const isImageUsed = async (db: Database, image: RecipeImage) => {
	const url = imageUrls(image)[0];
	if (!url) return false;
	const [row] = await db
		.execute<{ used: boolean }>(
			sql`
		select exists (select 1 from ${recipes} where position(${url} in ${recipes.image}::text) > 0)
			or exists (select 1 from ${recipeVersions} where position(${url} in ${recipeVersions.snapshot}::text) > 0)
			as used`
		)
		.then((result) => result.rows);
	return Boolean(row?.used);
};

/** Deletes the files of images that neither a recipe nor a version shows anymore */
export const deleteUnusedImages = async (db: Database, storage: Storage, images: RecipeImage[]) => {
	for (const image of images) {
		if (!(await isImageUsed(db, image))) {
			await storage.deleteFiles(imageUrls(image)).catch(console.error);
		}
	}
};
