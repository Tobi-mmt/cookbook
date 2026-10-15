import { error, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireEditor, requireUser } from './auth/guards';
import { getDb } from './context';
import { createCookbook } from './cookbooks';
import { cookbooks, users } from './db/schema';

/**
 * The cookbook a recipe is moved or copied into: one the person edits, or a new one with the
 * given name that is created on the way.
 */
export const resolveTargetCookbook = async (
	event: RequestEvent,
	body: { cookbookId?: unknown; newCookbookName?: unknown }
) => {
	const db = getDb();
	const name = typeof body.newCookbookName === 'string' ? body.newCookbookName.trim() : '';
	let id: string;
	let isNew = false;
	let user;
	if (name) {
		if (name.length > 80) error(400, 'Der Name ist zu lang.');
		user = await requireUser(event);
		({ id } = await createCookbook(db, user.id, name));
		isNew = true;
	} else {
		id = typeof body.cookbookId === 'string' ? body.cookbookId : '';
		if (!id) error(400, 'Bitte wähle ein Kochbuch.');
		user = await requireEditor(event, id);
	}

	const [cookbook] = await db
		.select({ id: cookbooks.id, name: cookbooks.name, slug: cookbooks.slug, owner: users.username })
		.from(cookbooks)
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(eq(cookbooks.id, id));
	if (!cookbook) error(404, 'Dieses Kochbuch gibt es nicht.');
	return {
		user,
		isNew,
		cookbook: { id: cookbook.id, name: cookbook.name, path: `/@${cookbook.owner}/${cookbook.slug}` }
	};
};
