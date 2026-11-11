import { fail, type RequestEvent } from '@sveltejs/kit';
import { requireUser } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import {
	createExport,
	findCurrentExports,
	loadPdfInput,
	PDF_QUALITIES,
	PDF_RECIPE_LIMIT
} from '#lib/server/cookbookPdf.js';
import { softImages, type PdfQuality } from '#lib/printLayout.js';
import { findCookbook, findProfile } from '#lib/server/profiles.js';
import { hitRateLimit } from '#lib/server/rateLimit.js';
import { countCookbookRecipes } from '#lib/server/recipes.js';
import { downloadUrl } from '#lib/server/storage.js';

/**
 * 60 seconds is the most the Hobby plan of Vercel allows, 75 recipes with images take about 20 to
 * 30 seconds on one CPU. A function of its own, so that only this route carries the Typst binary.
 */
export const config = { maxDuration: 60, split: true };

/** PDFs that are not stored yet, per person and hour */
const RENDERS_PER_HOUR = 10;

const loadCookbook = async (event: RequestEvent) => {
	const { handle, cookbook: slug } = event.params as { handle: string; cookbook: string };
	const db = getDb();
	const owner = await findProfile(db, handle, `/${slug}/pdf`);
	const cookbook = await findCookbook(db, owner.id, slug);
	return { db, owner, cookbook, count: await countCookbookRecipes(db, cookbook.id) };
};

/** Everybody signed in may create the PDF of a public cookbook */
export async function load(event) {
	await requireUser(event);
	const { db, owner, cookbook, count } = await loadCookbook(event);
	const base = {
		cookbook: { name: cookbook.name, slug: cookbook.slug, ownerUsername: owner.username ?? '' },
		count,
		limit: PDF_RECIPE_LIMIT
	};
	if (!count || count > PDF_RECIPE_LIMIT) return { ...base, soft: [], ready: {} };

	const input = await loadPdfInput(db, cookbook, event.url.origin);
	const ready = await findCurrentExports(db, cookbook.id, input);
	return {
		...base,
		soft: softImages(input.recipes),
		ready: Object.fromEntries(
			Object.entries(ready).map(([quality, file]) => [
				quality,
				{ ...file, url: downloadUrl(file.url) }
			])
		)
	};
}

export const actions = {
	default: async (event) => {
		const user = await requireUser(event);
		const quality = String((await event.request.formData()).get('quality')) as PdfQuality;
		if (!PDF_QUALITIES.includes(quality)) return fail(400, { error: 'Unbekannte Qualität.' });

		const { db, cookbook, count } = await loadCookbook(event);
		if (!count) return fail(400, { error: 'Das Kochbuch hat noch keine Rezepte.' });
		if (count > PDF_RECIPE_LIMIT) {
			return fail(400, {
				error: `Ein PDF kann höchstens ${PDF_RECIPE_LIMIT} Rezepte enthalten, dieses Kochbuch hat ${count}.`
			});
		}

		const input = await loadPdfInput(db, cookbook, event.url.origin);
		const stored = (await findCurrentExports(db, cookbook.id, input))[quality];
		if (!stored && !(await hitRateLimit(db, `pdf:${user.id}`, RENDERS_PER_HOUR, 60 * 60))) {
			return fail(429, {
				error: 'Du hast in der letzten Stunde schon viele PDFs erzeugt. Versuche es später wieder.'
			});
		}
		try {
			const file =
				stored ??
				(await createExport(db, getStorage(), { cookbookId: cookbook.id, input, quality }));
			return { quality, url: downloadUrl(file.url), bytes: file.bytes, pages: file.pages };
		} catch (cause) {
			console.error('Creating the PDF failed', cause);
			return fail(500, {
				error: 'Das PDF konnte nicht erzeugt werden. Versuche es später wieder.'
			});
		}
	}
};
