import { getDb } from '#lib/server/context.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';
import { findCopies } from '#lib/server/recipeTransfer.js';
import { slugerize } from '#lib/slugerize.js';

/** The own copies of a recipe, loaded by the recipe page in the browser */
export async function GET({ params, locals }) {
	const session = await locals.getSession();
	const db = getDb();
	const cookbookIds = session
		? (await listEditableCookbooks(db, session.user.id)).map(({ id }) => id)
		: [];
	const copies = await findCopies(db, params.id, cookbookIds);
	return Response.json(
		copies.map(({ id, title, cookbookId, cookbookName }) => ({
			url: `/rezept/${id}/${slugerize(title)}`,
			cookbookId,
			cookbookName
		})),
		{ headers: { 'cache-control': 'private, no-store' } }
	);
}
