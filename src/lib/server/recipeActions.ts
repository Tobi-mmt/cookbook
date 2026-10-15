import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { recipeInputSchema, type RecipeInput } from '../recipeInput';
import { slugerize } from '../slugerize';
import { affectedPaths } from './affectedPaths';
import { requireEditor } from './auth/guards';
import { listCategories } from './categories';
import { getDb, getStorage } from './context';
import { recipes, recipeVersions, users } from './db/schema';
import { processAndStoreImage } from './images';
import { createRecipeId, saveRecipe } from './recipes';
import { moveRecipeToTrash } from './trash';
import { extractRecipe } from './recipeImport/extract';
import { fetchPage, ImportError } from './recipeImport/fetchResource';
import { toRecipeInput } from './recipeImport/toRecipeInput';
import { revalidate } from './revalidate';
import { deleteUnusedImages, getVersion } from './versions';

/** Vercel functions accept at most 4.5 MB, the editor scales images down before the upload */
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const recipeUrl = (recipe: { id: string; title: string }) =>
	`/rezept/${recipe.id}/${slugerize(recipe.title)}`;

const parseInput = (form: FormData) => {
	let json: unknown;
	try {
		json = JSON.parse(String(form.get('recipe') ?? ''));
	} catch {
		return { error: 'Ungültige Formulardaten.' };
	}
	const parsed = recipeInputSchema.safeParse(json);
	return parsed.success
		? { input: parsed.data }
		: { error: parsed.error.issues.map((issue) => issue.message).join(', ') };
};

const readImage = async (form: FormData, recipeId: string) => {
	const file = form.get('image');
	if (!(file instanceof File) || file.size === 0) return {};
	if (!file.type.startsWith('image/')) return { error: 'Die Datei ist kein Bild.' };
	if (file.size > MAX_IMAGE_SIZE) return { error: 'Das Bild ist zu groß (max. 4 MB).' };
	try {
		return {
			image: await processAndStoreImage(
				Buffer.from(await file.arrayBuffer()),
				recipeId,
				getStorage()
			)
		};
	} catch (cause) {
		console.error(cause);
		return { error: 'Das Bild konnte nicht verarbeitet werden.' };
	}
};

export type Conflict = { version: number; by: string | null; at: Date };

/** Somebody else saved since the editor was opened */
const findConflict = async (
	db: ReturnType<typeof getDb>,
	recipeId: string,
	currentVersion: number,
	form: FormData
): Promise<Conflict | null> => {
	const baseVersion = Number(form.get('baseVersion'));
	if (!baseVersion || baseVersion === currentVersion || form.get('force') === '1') return null;
	const [latest] = await db
		.select({ at: recipeVersions.createdAt, by: users.name })
		.from(recipeVersions)
		.leftJoin(users, eq(users.id, recipeVersions.createdBy))
		.where(and(eq(recipeVersions.recipeId, recipeId), eq(recipeVersions.version, currentVersion)));
	return { version: currentVersion, by: latest?.by ?? null, at: latest?.at ?? new Date() };
};

const storeAndRevalidate = async (
	event: RequestEvent,
	{
		id,
		input,
		image,
		cookbookId,
		userId,
		previous
	}: {
		id: string;
		input: RecipeInput;
		image?: Parameters<typeof saveRecipe>[3]['image'];
		cookbookId: string;
		userId: string;
		previous?: { id: string; title: string };
	}
) => {
	const db = getDb();
	const { prunedImages } = await saveRecipe(db, id, input, { image, cookbookId, userId });
	await deleteUnusedImages(db, getStorage(), prunedImages);
	await revalidate(
		event.url.origin,
		await affectedPaths(db, {
			cookbookIds: [cookbookId],
			recipes: [{ id, title: input.title }, ...(previous ? [previous] : [])]
		})
	);
};

/** Creates a recipe in the cookbook of the form (no `existingId`) or updates one */
export const saveRecipeAction = async (event: RequestEvent, existingId?: string) => {
	const form = await event.request.formData();
	const db = getDb();

	const previous = existingId
		? await db.query.recipes.findFirst({ where: eq(recipes.id, existingId) })
		: undefined;
	if (existingId && !previous) error(404, 'Rezept nicht gefunden');
	const cookbookId = previous?.cookbookId ?? String(form.get('cookbookId') ?? '');
	const editor = await requireEditor(event, cookbookId);

	if (previous?.deletedAt) {
		const deletedBy = previous.deletedBy
			? await db.query.users.findFirst({ where: eq(users.id, previous.deletedBy) })
			: undefined;
		return fail(410, { deleted: { by: deletedBy?.name ?? null } });
	}
	const conflict = previous && (await findConflict(db, previous.id, previous.version, form));
	if (conflict) return fail(409, { conflict });

	const { input, error: inputError } = parseInput(form);
	if (!input) return fail(400, { error: inputError });

	const id = existingId ?? createRecipeId();
	const { image, error: imageError } = await readImage(form, id);
	if (imageError) return fail(400, { error: imageError });

	await storeAndRevalidate(event, { id, input, image, cookbookId, userId: editor.id, previous });

	await revalidate(
		event.url.origin,
		await affectedPaths(db, {
			cookbookIds: [cookbookId],
			recipes: [{ id, title: input.title }, ...(previous ? [previous] : [])]
		})
	);
	redirect(303, `${recipeUrl({ id, title: input.title })}?gespeichert`);
};

/** Moves the recipe to the trash of its cookbook, from where it can be restored for 30 days */
export const deleteRecipeAction = async (event: RequestEvent, id: string) => {
	const db = getDb();
	const previous = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
	if (!previous) error(404, 'Rezept nicht gefunden');
	const editor = await requireEditor(event, previous.cookbookId);

	await moveRecipeToTrash(db, id, editor.id);
	await revalidate(
		event.url.origin,
		await affectedPaths(db, { cookbookIds: [previous.cookbookId], recipes: [previous] })
	);
	return previous;
};

const importUrlSchema = z.url({ protocol: /^https?$/ });

export type ImportResult = {
	url: string;
	input: RecipeInput;
	/** set when the cookbook already has a recipe from this address */
	duplicate?: { id: string; title: string };
};

/** Reads a recipe from another site into the editor, nothing is stored before saving */
export const importRecipeAction = async (event: RequestEvent) => {
	const form = await event.request.formData();
	const cookbookId = String(form.get('cookbookId') ?? '');
	await requireEditor(event, cookbookId);

	const parsedUrl = importUrlSchema.safeParse(String(form.get('url') ?? '').trim());
	if (!parsedUrl.success) return fail(400, { error: 'Bitte eine gültige URL eingeben.' });
	const url = parsedUrl.data;

	let html: string;
	try {
		html = await fetchPage(url);
	} catch (cause) {
		if (cause instanceof ImportError) return fail(400, { url, error: cause.message });
		throw cause;
	}

	const scraped = extractRecipe(html);
	if (!scraped) return fail(422, { url, error: 'Auf dieser Seite wurde kein Rezept gefunden.' });

	const db = getDb();
	const parsed = recipeInputSchema.safeParse(toRecipeInput(scraped, url, await listCategories(db)));
	if (!parsed.success) {
		return fail(422, { url, error: parsed.error.issues.map((issue) => issue.message).join(', ') });
	}

	const duplicate = await db.query.recipes.findFirst({
		where: and(
			eq(recipes.cookbookId, cookbookId),
			eq(recipes.sourceUrl, url),
			isNull(recipes.deletedAt)
		),
		columns: { id: true, title: true }
	});
	return { imported: { url, input: parsed.data, duplicate } satisfies ImportResult };
};

/** Makes an old version current again by saving it as a new version */
export const restoreVersionAction = async (event: RequestEvent, id: string) => {
	const form = await event.request.formData();
	const db = getDb();
	const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
	if (!recipe || recipe.deletedAt) error(404, 'Rezept nicht gefunden');
	const editor = await requireEditor(event, recipe.cookbookId);

	const conflict = await findConflict(db, id, recipe.version, form);
	if (conflict) return fail(409, { conflict });

	const version = await getVersion(db, id, Number(form.get('version')));
	if (!version) error(404, 'Version nicht gefunden');

	const { input, image } = version.snapshot;
	await storeAndRevalidate(event, {
		id,
		input,
		image,
		cookbookId: recipe.cookbookId,
		userId: editor.id,
		previous: recipe
	});
	redirect(303, `${recipeUrl({ id, title: input.title })}?gespeichert`);
};
