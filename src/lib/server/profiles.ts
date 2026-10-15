import { error, redirect } from '@sveltejs/kit';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import type { PersonRef } from '../../types';
import type { Database } from './db/client';
import { cookbookEditors, cookbooks, users } from './db/schema';
import { findMovedCookbook } from './cookbooks';
import { findRenamedUsername } from './users';

const INDEXING_DELAY_DAYS = 14;

/** New accounts are not indexed for two weeks, which takes the point out of SEO spam */
export const isNewAccount = (createdAt: Date, now = new Date()) =>
	now.getTime() - createdAt.getTime() < INDEXING_DELAY_DAYS * 24 * 60 * 60 * 1000;

/** Finds a person by `@handle`, redirects for upper case and former usernames */
export const findProfile = async (db: Database, handle: string, rest = '') => {
	const username = handle.slice(1).toLowerCase();
	if (handle.slice(1) !== username) redirect(301, `/@${username}${rest}`);

	const user = await db.query.users.findFirst({ where: eq(users.username, username) });
	if (user && !user.banned) return user;

	const renamed = await findRenamedUsername(db, username);
	if (renamed && renamed !== username) redirect(301, `/@${renamed}${rest}`);
	error(404, 'Diese Person gibt es nicht');
};

export type CookbookWithMembers = {
	id: string;
	name: string;
	slug: string;
	ownerUsername: string;
	members: (PersonRef & { role: 'owner' | 'editor' })[];
};

/** Visible cookbooks with their members, in the order the members joined */
export const listCookbooksWithMembers = async (
	db: Database,
	filter: { editorId: string } | { cookbookId: string }
): Promise<CookbookWithMembers[]> => {
	const ids =
		'cookbookId' in filter
			? [filter.cookbookId]
			: (
					await db
						.select({ id: cookbookEditors.cookbookId })
						.from(cookbookEditors)
						.where(eq(cookbookEditors.userId, filter.editorId))
				).map(({ id }) => id);
	if (!ids.length) return [];

	const rows = await db
		.select({
			id: cookbooks.id,
			name: cookbooks.name,
			slug: cookbooks.slug,
			ownerId: cookbooks.ownerId,
			createdAt: cookbooks.createdAt,
			memberUsername: users.username,
			memberName: users.name,
			memberId: users.id,
			role: cookbookEditors.role
		})
		.from(cookbooks)
		.innerJoin(cookbookEditors, eq(cookbookEditors.cookbookId, cookbooks.id))
		.innerJoin(users, eq(users.id, cookbookEditors.userId))
		.where(and(inArray(cookbooks.id, ids), isNull(cookbooks.deletedAt), isNull(cookbooks.hiddenAt)))
		.orderBy(asc(cookbooks.createdAt), asc(cookbookEditors.joinedAt));

	const byId = new Map<string, CookbookWithMembers>();
	for (const row of rows) {
		const cookbook = byId.get(row.id) ?? {
			id: row.id,
			name: row.name,
			slug: row.slug,
			ownerUsername: '',
			members: []
		};
		if (row.memberId === row.ownerId) cookbook.ownerUsername = row.memberUsername ?? '';
		if (row.memberUsername) {
			cookbook.members.push({ username: row.memberUsername, name: row.memberName, role: row.role });
		}
		byId.set(row.id, cookbook);
	}
	return [...byId.values()];
};

/** Finds a cookbook by owner and slug, redirects for renamed ones and ones with a new owner */
export const findCookbook = async (db: Database, ownerId: string, slug: string) => {
	const cookbook = await db.query.cookbooks.findFirst({
		where: and(eq(cookbooks.ownerId, ownerId), eq(cookbooks.slug, slug))
	});
	if (cookbook && !cookbook.deletedAt && !cookbook.hiddenAt) return cookbook;

	const moved = !cookbook && (await findMovedCookbook(db, ownerId, slug));
	if (moved) redirect(301, `/@${moved.username}/${moved.slug}`);
	error(404, 'Dieses Kochbuch gibt es nicht');
};

/** "gemeinsam mit Mona und Tobias" from the point of view of one member */
export const sharedWith = (members: PersonRef[], username: string) => {
	const others = members.filter((member) => member.username !== username).map(({ name }) => name);
	if (!others.length) return undefined;
	const names =
		others.length === 1 ? others[0] : `${others.slice(0, -1).join(', ')} und ${others.at(-1)}`;
	return `gemeinsam mit ${names}`;
};
