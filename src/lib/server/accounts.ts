import { and, asc, eq, inArray, isNull, lt, ne } from 'drizzle-orm';
import type { Database } from './db/client';
import {
	cookbookEditors,
	cookbooks,
	deletionLog,
	recipes,
	sessions,
	usernameHistory,
	users
} from './db/schema';
import { transferCookbook } from './cookbooks';
import { releaseDate } from './users';
import type { Storage } from './storage';
import { purgeTrash, TRASH_DAYS } from './trash';

export const deletionDate = (requestedAt: Date) =>
	new Date(requestedAt.getTime() + TRASH_DAYS * 24 * 60 * 60 * 1000);

export const isLastAdmin = async (db: Database, userId: string) => {
	const admins = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.role, 'admin'), eq(users.banned, false)));
	return admins.length === 1 && admins[0].id === userId;
};

/**
 * Deletes an account: cookbooks without other editors go with it, shared ones keep their
 * recipes and get the editor who joined first as owner. The username stays blocked for six
 * months, recipes created by the person show "einer ehemaligen Person".
 */
export const deleteAccount = async (db: Database, storage: Storage, userId: string) => {
	const memberships = await db
		.select({ cookbookId: cookbookEditors.cookbookId, role: cookbookEditors.role })
		.from(cookbookEditors)
		.where(eq(cookbookEditors.userId, userId));

	const alone: string[] = [];
	for (const { cookbookId, role } of memberships) {
		const [successor] = await db
			.select({ userId: cookbookEditors.userId })
			.from(cookbookEditors)
			.where(and(eq(cookbookEditors.cookbookId, cookbookId), ne(cookbookEditors.userId, userId)))
			.orderBy(asc(cookbookEditors.joinedAt))
			.limit(1);
		if (!successor) alone.push(cookbookId);
		else if (role === 'owner') await transferCookbook(db, cookbookId, successor.userId);
	}

	if (alone.length) {
		const past = new Date(0);
		await db.update(cookbooks).set({ deletedAt: past }).where(inArray(cookbooks.id, alone));
		await purgeTrash(db, storage, new Date());
	}

	const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
	await db.transaction(async (tx) => {
		if (user?.username) {
			await tx
				.insert(usernameHistory)
				.values({ oldUsername: user.username, userId: null, releasedAt: releaseDate() })
				.onConflictDoUpdate({
					target: usernameHistory.oldUsername,
					set: { userId: null, releasedAt: releaseDate() }
				});
		}
		await tx
			.update(usernameHistory)
			.set({ userId: null })
			.where(eq(usernameHistory.userId, userId));
		await tx.insert(deletionLog).values({ userId }).onConflictDoNothing();
		await tx.delete(users).where(eq(users.id, userId));
	});
};

/** Accounts whose 30 days are over, deleted by the daily job */
export const deleteRequestedAccounts = async (db: Database, storage: Storage, now = new Date()) => {
	const cutoff = new Date(now.getTime() - TRASH_DAYS * 24 * 60 * 60 * 1000);
	const due = await db
		.select({ id: users.id })
		.from(users)
		.where(lt(users.deletionRequestedAt, cutoff));
	for (const { id } of due) await deleteAccount(db, storage, id);
	return due.length;
};

export const signOutEverywhere = (db: Database, userId: string) =>
	db.delete(sessions).where(eq(sessions.userId, userId));

/** Everything a person wrote, as JSON for the download in /konto */
export const exportAccount = async (db: Database, userId: string) => {
	const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
	const ownCookbooks = await db
		.select({ id: cookbooks.id, name: cookbooks.name, slug: cookbooks.slug })
		.from(cookbookEditors)
		.innerJoin(cookbooks, eq(cookbooks.id, cookbookEditors.cookbookId))
		.where(eq(cookbookEditors.userId, userId));
	const recipeRows = ownCookbooks.length
		? await db
				.select()
				.from(recipes)
				.where(
					and(
						inArray(
							recipes.cookbookId,
							ownCookbooks.map(({ id }) => id)
						),
						isNull(recipes.deletedAt)
					)
				)
		: [];
	return {
		exportedAt: new Date().toISOString(),
		license: 'CC BY-SA 4.0',
		person: user && {
			name: user.name,
			username: user.username,
			email: user.email,
			createdAt: user.createdAt
		},
		cookbooks: ownCookbooks.map((cookbook) => ({
			...cookbook,
			recipes: recipeRows.filter((recipe) => recipe.cookbookId === cookbook.id)
		}))
	};
};
