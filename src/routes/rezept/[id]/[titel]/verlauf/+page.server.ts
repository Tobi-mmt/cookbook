import { error } from '@sveltejs/kit';
import { requireEditor } from '#lib/server/auth/guards.js';
import { categoriesById } from '#lib/server/categories.js';
import { getDb } from '#lib/server/context.js';
import { restoreVersionAction } from '#lib/server/recipeActions.js';
import { getRecipe } from '#lib/server/recipes.js';
import { getVersion, listVersions } from '#lib/server/versions.js';
import { recipeFromInput } from '#lib/recipeFromInput.js';

export async function load(event) {
	const db = getDb();
	const found = await getRecipe(db, event.params.id);
	if (!found || found.deletedAt) error(404, 'Rezept nicht gefunden');
	await requireEditor(event, found.cookbookId);

	const [versions, categories] = await Promise.all([
		listVersions(db, event.params.id),
		categoriesById(db)
	]);
	const selected = Number(event.url.searchParams.get('version')) || versions[0]?.version;
	const version = selected ? await getVersion(db, event.params.id, selected) : undefined;
	const { recipe } = found;
	const { input, image } = version?.snapshot ?? {};

	return {
		recipe,
		currentVersion: versions[0]?.version,
		versions,
		selected,
		preview:
			input &&
			recipeFromInput(
				input,
				image ?? null,
				categories.get(input.categoryId) ?? recipe.meta.category,
				recipe
			)
	};
}

export const actions = {
	restore: (event) => restoreVersionAction(event, event.params.id)
};
