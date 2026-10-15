import { eq } from 'drizzle-orm';
import type { ReportTarget } from '../../reportReasons';
import type { Database } from '../db/client';
import { cookbookEditors, cookbooks, recipes, users } from '../db/schema';
import { getRecipe } from '../recipes';

/** The reported object as it is now, null once it was deleted */
export const loadTarget = async (db: Database, type: ReportTarget, id: string) => {
	if (type === 'recipe' || type === 'image') {
		const found = await getRecipe(db, id);
		if (!found || found.deletedAt) return null;
		const { recipe } = found;
		return type === 'image'
			? recipe.image && {
					type,
					title: recipe.title,
					image: recipe.image,
					cookbookId: found.cookbookId
				}
			: {
					type,
					title: recipe.title,
					cookbookId: found.cookbookId,
					hiddenReason: found.hiddenReason,
					recipe
				};
	}
	if (type === 'cookbook') {
		const cookbook = await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, id) });
		return cookbook && !cookbook.deletedAt
			? { type, title: cookbook.name, cookbookId: cookbook.id, slug: cookbook.slug }
			: null;
	}
	const user = await db.query.users.findFirst({ where: eq(users.id, id) });
	return user
		? { type, title: user.name, username: user.username, banned: Boolean(user.banned) }
		: null;
};

export type Target = NonNullable<Awaited<ReturnType<typeof loadTarget>>>;

/** The people a decision about the object concerns: the editors of its cookbook or the person */
export const affectedUsers = async (db: Database, type: ReportTarget, id: string) => {
	if (type === 'user') {
		return db
			.select({ id: users.id, email: users.email, name: users.name })
			.from(users)
			.where(eq(users.id, id));
	}
	const cookbookId =
		type === 'cookbook'
			? id
			: (
					await db.query.recipes.findFirst({
						where: eq(recipes.id, id),
						columns: { cookbookId: true }
					})
				)?.cookbookId;
	if (!cookbookId) return [];
	return db
		.select({ id: users.id, email: users.email, name: users.name })
		.from(cookbookEditors)
		.innerJoin(users, eq(users.id, cookbookEditors.userId))
		.where(eq(cookbookEditors.cookbookId, cookbookId));
};
