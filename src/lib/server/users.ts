import { and, eq, gt } from 'drizzle-orm';
import type { Database } from './db/client';
import { usernameHistory, users } from './db/schema';

const BLOCKED_MONTHS = 6;

export const releaseDate = (now = new Date()) => {
	const date = new Date(now);
	date.setMonth(date.getMonth() + BLOCKED_MONTHS);
	return date;
};

/** Free when no other person uses it and it was not given up by somebody else recently */
export const isUsernameAvailable = async (
	db: Database,
	username: string,
	userId?: string,
	now = new Date()
) => {
	const [current, former] = await Promise.all([
		db.query.users.findFirst({ where: eq(users.username, username), columns: { id: true } }),
		db.query.usernameHistory.findFirst({
			where: and(eq(usernameHistory.oldUsername, username), gt(usernameHistory.releasedAt, now))
		})
	]);
	return (!current || current.id === userId) && (!former || former.userId === userId);
};

/** The old name keeps redirecting and stays blocked for others for six months */
export const changeUsername = (db: Database, userId: string, username: string) =>
	db.transaction(async (tx) => {
		const user = await tx.query.users.findFirst({ where: eq(users.id, userId) });
		if (!user || user.username === username) return;
		if (user.username) {
			await tx
				.insert(usernameHistory)
				.values({ oldUsername: user.username, userId, releasedAt: releaseDate() })
				.onConflictDoUpdate({
					target: usernameHistory.oldUsername,
					set: { userId, releasedAt: releaseDate() }
				});
		}
		await tx.delete(usernameHistory).where(eq(usernameHistory.oldUsername, username));
		await tx.update(users).set({ username }).where(eq(users.id, userId));
	});

/** The current username of a former one, for redirects */
export const findRenamedUsername = async (db: Database, oldUsername: string) => {
	const [row] = await db
		.select({ username: users.username })
		.from(usernameHistory)
		.innerJoin(users, eq(users.id, usernameHistory.userId))
		.where(eq(usernameHistory.oldUsername, oldUsername));
	return row?.username ?? null;
};
