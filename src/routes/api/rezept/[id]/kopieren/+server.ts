import { error } from '@sveltejs/kit';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { getDb, getStorage } from '#lib/server/context.js';
import { getRecipe } from '#lib/server/recipes.js';
import { copyRecipe, findCopies } from '#lib/server/recipeTransfer.js';
import { revalidate } from '#lib/server/revalidate.js';
import { withinDailyLimit } from '#lib/server/recipeActions.js';
import { storageStatus } from '#lib/server/storageUsage.js';
import { slugerize } from '#lib/slugerize.js';
import { resolveTargetCookbook } from '#lib/server/targetCookbook.js';

/** "In mein Kochbuch" */
export async function POST(event) {
	const body = await event.request.json();
	const db = getDb();
	const source = await getRecipe(db, event.params.id);
	if (!source?.visible) error(404, 'Rezept nicht gefunden');

	const { user, cookbook, isNew } = await resolveTargetCookbook(event, body);
	const cookbookId = cookbook.id;
	const [existing] = await findCopies(db, source.recipe.id, [cookbookId]);
	if (existing) {
		return Response.json(
			{ url: `/rezept/${existing.id}/${slugerize(existing.title)}`, existing: true },
			{ status: 409 }
		);
	}
	if (source.recipe.image && (await storageStatus(db, user.id)).full) {
		error(507, 'Dein Speicher für Bilder ist voll.');
	}
	if (!(await withinDailyLimit(user, 'recipes'))) {
		error(429, 'Du hast heute schon sehr viele Rezepte angelegt.');
	}
	const copy = await copyRecipe(db, getStorage(), {
		sourceId: source.recipe.id,
		cookbookId,
		userId: user.id
	});
	await revalidate(
		event.url.origin,
		await affectedPaths(db, { cookbookIds: [cookbookId], recipes: [copy] })
	);
	return Response.json({ url: `/rezept/${copy.id}/${slugerize(copy.title)}`, cookbook, isNew });
}
