import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { RecipeImage } from '../../types';
import { recipeInputSchema } from '../recipeInput';
import { getDb, getStorage } from './context';
import { imageUrls, processAndStoreImage } from './images';
import { createRecipeId, deleteRecipe, getRecipeMeta, saveRecipe } from './recipes';
import { LIST_PATHS, recipePaths, revalidate } from './revalidate';

/** Vercel functions accept at most 4.5 MB, the editor scales images down before the upload */
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const done = (id: string, failedPaths: string[], action: 'saved' | 'deleted') => {
	const params = new URLSearchParams({ [action]: id });
	if (failedPaths.length) params.set('revalidateFailed', '1');
	redirect(303, `/admin?${params}`);
};

/** Creates (no `id`) or updates a recipe, used by the new and the edit page */
export const saveRecipeAction = async ({ request, url }: RequestEvent, existingId?: string) => {
	const form = await request.formData();

	let json: unknown;
	try {
		json = JSON.parse(String(form.get('recipe') ?? ''));
	} catch {
		return fail(400, { error: 'Ungültige Formulardaten.' });
	}
	const parsed = recipeInputSchema.safeParse(json);
	if (!parsed.success) {
		return fail(400, { error: parsed.error.issues.map((issue) => issue.message).join(', ') });
	}
	const input = parsed.data;

	const db = getDb();
	const storage = getStorage();
	const previous = existingId ? await getRecipeMeta(db, existingId) : undefined;
	if (existingId && !previous) return fail(404, { error: 'Rezept nicht gefunden.' });
	const id = existingId ?? createRecipeId();

	let image: RecipeImage | undefined;
	const file = form.get('image');
	if (file instanceof File && file.size > 0) {
		if (!file.type.startsWith('image/')) return fail(400, { error: 'Die Datei ist kein Bild.' });
		if (file.size > MAX_IMAGE_SIZE)
			return fail(400, { error: 'Das Bild ist zu groß (max. 4 MB).' });
		try {
			image = await processAndStoreImage(Buffer.from(await file.arrayBuffer()), id, storage);
		} catch (error) {
			console.error(error);
			return fail(400, { error: 'Das Bild konnte nicht verarbeitet werden.' });
		}
	}

	await saveRecipe(db, id, input, image);
	if (image && previous?.image) {
		await storage.deleteFiles(imageUrls(previous.image)).catch(console.error);
	}

	const paths = [...LIST_PATHS, ...recipePaths({ id, title: input.title })];
	if (previous && previous.title !== input.title) paths.push(...recipePaths(previous));
	done(id, await revalidate(url.origin, paths), 'saved');
};

export const deleteRecipeAction = async ({ request, url }: RequestEvent) => {
	const id = String((await request.formData()).get('id') ?? '');
	const db = getDb();
	const previous = await getRecipeMeta(db, id);
	if (!previous) return fail(404, { error: 'Rezept nicht gefunden.' });

	await deleteRecipe(db, id);
	await getStorage().deleteFiles(imageUrls(previous.image)).catch(console.error);

	done(id, await revalidate(url.origin, [...LIST_PATHS, ...recipePaths(previous)]), 'deleted');
};
