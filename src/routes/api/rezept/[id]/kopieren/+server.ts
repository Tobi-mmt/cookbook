import { error } from '@sveltejs/kit';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireEditor } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import { getRecipe } from '#lib/server/recipes.js';
import { copyRecipe } from '#lib/server/recipeTransfer.js';
import { revalidate } from '#lib/server/revalidate.js';
import { slugerize } from '#lib/slugerize.js';

/** "In mein Kochbuch" */
export async function POST(event) {
	const { cookbookId } = await event.request.json();
	const user = await requireEditor(event, String(cookbookId));
	const db = getDb();
	const source = await getRecipe(db, event.params.id);
	if (!source?.visible) error(404, 'Rezept nicht gefunden');

	const copy = await copyRecipe(db, getStorage(), {
		sourceId: source.recipe.id,
		cookbookId,
		userId: user.id
	});
	await revalidate(
		event.url.origin,
		await affectedPaths(db, { cookbookIds: [cookbookId], recipes: [copy] })
	);
	return Response.json({ url: `/rezept/${copy.id}/${slugerize(copy.title)}` });
}
