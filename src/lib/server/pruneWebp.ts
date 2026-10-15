/**
 * TEMPORARY: removes the WebP variants that images stored before AVIF-first still have.
 * Run once in production at /admin/maintenance, then delete this file, its test and the page.
 */
import { del, list } from '@vercel/blob';
import { eq, isNotNull } from 'drizzle-orm';
import type { RecipeImage } from '../../types';
import type { Database } from './db/client';
import { recipes } from './db/schema';
import { imageUrls, WEBP_WIDTH } from './images';
import { LIST_PATHS, recipePaths, revalidate } from './revalidate';

/**
 * Reduces the WebP variants to the one that is kept since AVIF-first,
 * the smallest one with at least `WEBP_WIDTH`. Returns the URLs of the removed variants.
 */
export const pruneWebpVariants = (image: RecipeImage) => {
	const { webp } = image.variants;
	const kept = webp.find(({ width }) => width >= WEBP_WIDTH) ?? webp[webp.length - 1];
	return {
		image: { ...image, variants: { ...image.variants, webp: [kept] } },
		removed: webp.filter((variant) => variant !== kept).map(({ url }) => url)
	};
};

/** Files are compared by path, so that differences in the host or the encoding do not matter */
const blobPath = (url: string) => decodeURIComponent(new URL(url).pathname.slice(1));

export type UnusedFile = { pathname: string; url: string; size: number };

export type PruningPlan = {
	recipesWithImage: number;
	changes: { id: string; title: string; image: RecipeImage; removed: string[] }[];
	/** files below `recipes/` that no recipe links once the WebP variants are pruned */
	unusedFiles: UnusedFile[];
	/** linked files that are missing in the storage, deleting is refused while there are any */
	missingFiles: string[];
};

export const planPruning = async (db: Database, token: string): Promise<PruningPlan> => {
	const rows = await db
		.select({ id: recipes.id, title: recipes.title, image: recipes.image })
		.from(recipes)
		.where(isNotNull(recipes.image));

	const pruned = rows.map((row) => ({ ...row, ...pruneWebpVariants(row.image!) }));
	const linked = new Set(pruned.flatMap(({ image }) => imageUrls(image).map(blobPath)));

	const stored: UnusedFile[] = [];
	let cursor: string | undefined;
	do {
		const page = await list({ prefix: 'recipes/', token, cursor, limit: 1000 });
		stored.push(...page.blobs.map(({ pathname, url, size }) => ({ pathname, url, size })));
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);

	const storedPaths = new Set(stored.map(({ pathname }) => pathname));
	return {
		recipesWithImage: rows.length,
		changes: pruned.filter(({ removed }) => removed.length),
		unusedFiles: stored.filter(({ pathname }) => !linked.has(pathname)),
		missingFiles: [...linked].filter((pathname) => !storedPaths.has(pathname))
	};
};

export type PruningResult =
	| { ok: true; updatedRecipes: number; deletedFiles: number; deletedBytes: number }
	| { ok: false; error: string; failedPaths?: string[] };

/**
 * 1. removes the variants from the database, 2. re-renders the cached pages, which still link
 * them, 3. deletes all unused files. Every step can be repeated, so a failed run is finished by
 * running it again.
 */
export const prune = async (
	db: Database,
	token: string,
	origin: string
): Promise<PruningResult> => {
	const plan = await planPruning(db, token);
	for (const { id, image } of plan.changes) {
		await db.update(recipes).set({ image }).where(eq(recipes.id, id));
	}

	const rows = await db
		.select({ id: recipes.id, title: recipes.title })
		.from(recipes)
		.where(isNotNull(recipes.image));
	const failedPaths = await revalidate(origin, [...LIST_PATHS, ...rows.flatMap(recipePaths)]);
	if (failedPaths.length) {
		return {
			ok: false,
			error: 'Einige Seiten konnten nicht neu erzeugt werden, es wurde nichts gelöscht.',
			failedPaths
		};
	}

	const { unusedFiles, missingFiles } = await planPruning(db, token);
	if (missingFiles.length) {
		return {
			ok: false,
			error: `${missingFiles.length} verlinkte Dateien fehlen im Speicher. Zur Sicherheit wurde nichts gelöscht.`
		};
	}
	for (let index = 0; index < unusedFiles.length; index += 100) {
		await del(
			unusedFiles.slice(index, index + 100).map(({ url }) => url),
			{ token }
		);
	}

	return {
		ok: true,
		updatedRecipes: plan.changes.length,
		deletedFiles: unusedFiles.length,
		deletedBytes: unusedFiles.reduce((sum, { size }) => sum + size, 0)
	};
};
