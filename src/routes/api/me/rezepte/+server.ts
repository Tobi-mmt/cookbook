import { inArray } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';
import { recipes } from '#lib/server/db/schema.js';
import { listRecipeSummaries } from '#lib/server/recipes.js';

/** The recipes of all own cookbooks for "Meine Rezepte" on the cached home page */
export async function GET({ locals }) {
	const session = await locals.getSession();
	const db = getDb();
	const cookbookIds = session
		? (await listEditableCookbooks(db, session.user.id)).map(({ id }) => id)
		: [];
	const summaries = cookbookIds.length
		? await listRecipeSummaries(db, inArray(recipes.cookbookId, cookbookIds))
		: [];
	return Response.json(summaries, { headers: { 'cache-control': 'private, no-store' } });
}
