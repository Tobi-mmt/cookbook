// TEMPORARY: see src/lib/server/pruneWebp.ts
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
import { getDb } from '#lib/server/context.js';
import { planPruning, prune } from '#lib/server/pruneWebp.js';

/** Re-rendering all pages and deleting the files can take longer than the default limit */
export const config = { maxDuration: 60 };

export async function load() {
	if (!BLOB_READ_WRITE_TOKEN) return { plan: null };

	const { recipesWithImage, changes, unusedFiles, missingFiles } = await planPruning(
		getDb(),
		BLOB_READ_WRITE_TOKEN
	);
	return {
		plan: {
			recipesWithImage,
			changes: changes.map(({ id, title, removed }) => ({ id, title, removed: removed.length })),
			unusedFiles,
			missingFiles
		}
	};
}

export const actions = {
	default: async ({ url }) => {
		if (!BLOB_READ_WRITE_TOKEN) {
			return { result: { ok: false as const, error: 'Nur mit Vercel Blob möglich' } };
		}
		return { result: await prune(getDb(), BLOB_READ_WRITE_TOKEN, url.origin) };
	}
};
