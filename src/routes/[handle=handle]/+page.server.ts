import { inArray } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { isrConfig } from '#lib/server/isr.js';
import {
	findProfile,
	isNewAccount,
	listCookbooksWithMembers,
	sharedWith
} from '#lib/server/profiles.js';
import { listRecipeSummaries } from '#lib/server/recipes.js';

export const config = isrConfig;

export async function load({ params }) {
	const db = getDb();
	const user = await findProfile(db, params.handle);
	const username = user.username!;
	const cookbooks = await listCookbooksWithMembers(db, { editorId: user.id });
	const recipeList = cookbooks.length
		? await listRecipeSummaries(
				db,
				inArray(
					recipes.cookbookId,
					cookbooks.map(({ id }) => id)
				)
			)
		: [];

	return {
		profile: { id: user.id, username, name: user.name },
		cookbooks: cookbooks.map((cookbook) => ({
			...cookbook,
			hint: sharedWith(cookbook.members, username)
		})),
		recipes: recipeList,
		noindex: isNewAccount(user.createdAt)
	};
}
