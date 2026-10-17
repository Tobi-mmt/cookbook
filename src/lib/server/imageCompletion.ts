import { sql } from 'drizzle-orm';
import { affectedPaths } from './affectedPaths';
import type { Database } from './db/client';
import { recipes, recipeVersions } from './db/schema';
import type { AvifVariants } from './images';
import { revalidate } from './revalidate';
import type { Storage } from './storage';

/**
 * Adds the AVIF variants to every recipe and version that still shows the image with this WebP,
 * after the response went out. If the image was replaced meanwhile, the files are deleted again.
 */
export const completeImage = async (
	db: Database,
	storage: Storage,
	{
		webpUrl,
		createAvif,
		origin,
		cookbookId,
		recipe
	}: {
		webpUrl: string;
		createAvif: () => Promise<AvifVariants>;
		origin: string;
		cookbookId: string;
		recipe: { id: string; title: string };
	}
) => {
	const avif = await createAvif();
	const variants = JSON.stringify(avif.variants);

	const current = await db
		.update(recipes)
		.set({
			image: sql`jsonb_set(jsonb_set(${recipes.image}, '{variants,avif}', ${variants}::jsonb), '{bytes}', to_jsonb(coalesce((${recipes.image}->>'bytes')::bigint, 0) + ${avif.bytes}))`
		})
		.where(sql`${recipes.image}->'variants'->'webp'->0->>'url' = ${webpUrl}`)
		.returning({ id: recipes.id });
	const versions = await db
		.update(recipeVersions)
		.set({
			snapshot: sql`jsonb_set(jsonb_set(${recipeVersions.snapshot}, '{image,variants,avif}', ${variants}::jsonb), '{image,bytes}', to_jsonb(coalesce((${recipeVersions.snapshot}->'image'->>'bytes')::bigint, 0) + ${avif.bytes}))`
		})
		.where(sql`${recipeVersions.snapshot}->'image'->'variants'->'webp'->0->>'url' = ${webpUrl}`)
		.returning({ id: recipeVersions.id });

	if (!current.length && !versions.length) {
		await storage.deleteFiles(avif.variants.map(({ url }) => url));
		return;
	}
	await revalidate(
		origin,
		await affectedPaths(db, { cookbookIds: [cookbookId], recipes: [recipe] })
	);
};
