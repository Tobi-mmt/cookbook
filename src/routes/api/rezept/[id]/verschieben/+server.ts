import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireEditor } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { moveRecipe } from '#lib/server/recipeTransfer.js';
import { revalidate } from '#lib/server/revalidate.js';
import { resolveTargetCookbook } from '#lib/server/targetCookbook.js';

/** Moving needs editing rights in both cookbooks, or a new cookbook is created for it */
export async function POST(event) {
	const body = await event.request.json();
	const db = getDb();
	const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, event.params.id) });
	if (!recipe || recipe.deletedAt) error(404, 'Rezept nicht gefunden');
	await requireEditor(event, recipe.cookbookId);
	const { cookbook, isNew } = await resolveTargetCookbook(event, body);

	await moveRecipe(db, recipe.id, cookbook.id);
	await revalidate(
		event.url.origin,
		await affectedPaths(db, { cookbookIds: [recipe.cookbookId, cookbook.id], recipes: [recipe] })
	);
	return Response.json({ cookbook, isNew });
}
