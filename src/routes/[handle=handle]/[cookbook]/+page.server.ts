import { eq } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { isrConfig } from '#lib/server/isr.js';
import {
	findCookbook,
	findProfile,
	isNewAccount,
	listCookbooksWithMembers
} from '#lib/server/profiles.js';
import { listRecipeSummaries } from '#lib/server/recipes.js';

export const config = isrConfig;

export async function load({ params }) {
	const db = getDb();
	const owner = await findProfile(db, params.handle, `/${params.cookbook}`);
	const { id } = await findCookbook(db, owner.id, params.cookbook);
	const [[cookbook], recipeList] = await Promise.all([
		listCookbooksWithMembers(db, { cookbookId: id }),
		listRecipeSummaries(db, eq(recipes.cookbookId, id))
	]);
	return { cookbook, recipes: recipeList, noindex: isNewAccount(owner.createdAt) };
}
