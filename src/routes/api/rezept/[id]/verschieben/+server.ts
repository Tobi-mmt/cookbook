import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireEditor } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { moveRecipe } from '#lib/server/recipeTransfer.js';
import { revalidate } from '#lib/server/revalidate.js';

/** Moving needs editing rights in both cookbooks */
export async function POST(event) {
	const { cookbookId } = await event.request.json();
	const db = getDb();
	const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, event.params.id) });
	if (!recipe || recipe.deletedAt) error(404, 'Rezept nicht gefunden');
	await requireEditor(event, recipe.cookbookId);
	await requireEditor(event, String(cookbookId));

	await moveRecipe(db, recipe.id, cookbookId);
	await revalidate(
		event.url.origin,
		await affectedPaths(db, { cookbookIds: [recipe.cookbookId, cookbookId], recipes: [recipe] })
	);
	return new Response(null, { status: 204 });
}
