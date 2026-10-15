import { and, asc, eq, isNull } from 'drizzle-orm';
import { RESERVED_NAMES, toSlug } from '../username';
import type { Database } from './db/client';
import { cookbookEditors, cookbooks, cookbookSlugHistory, users } from './db/schema';
import { createId } from './ids';

export const DEFAULT_COOKBOOK_NAME = 'Mein Kochbuch';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/** Slugs are unique per owner, a taken one gets a number, reserved ones like `einstellungen` too */
export const freeSlug = async (db: Database | Transaction, ownerId: string, name: string) => {
	const base = toSlug(name, 60) || 'kochbuch';
	const taken = new Set(
		(
			await db
				.select({ slug: cookbooks.slug })
				.from(cookbooks)
				.where(eq(cookbooks.ownerId, ownerId))
		).map(({ slug }) => slug)
	);
	for (let index = 1; ; index++) {
		const slug = index === 1 ? base : `${base}-${index}`;
		if (!taken.has(slug) && !RESERVED_NAMES.has(slug)) return slug;
	}
};

export const createCookbook = (db: Database, ownerId: string, name: string) =>
	db.transaction(async (tx) => {
		const id = createId();
		const slug = await freeSlug(tx, ownerId, name);
		await tx.insert(cookbooks).values({ id, ownerId, slug, name });
		await tx.insert(cookbookEditors).values({ cookbookId: id, userId: ownerId, role: 'owner' });
		return { id, slug };
	});

/** Every person keeps at least one cookbook, the first one is created with the account */
export const ensureCookbook = async (db: Database, userId: string) => {
	const existing = await db.query.cookbookEditors.findFirst({
		where: eq(cookbookEditors.userId, userId)
	});
	if (!existing) await createCookbook(db, userId, DEFAULT_COOKBOOK_NAME);
};

export type EditableCookbook = {
	id: string;
	name: string;
	slug: string;
	ownerUsername: string;
	role: 'owner' | 'editor';
};

/** The cookbooks somebody may edit, their own first */
export const listEditableCookbooks = async (
	db: Database,
	userId: string
): Promise<EditableCookbook[]> =>
	(
		await db
			.select({
				id: cookbooks.id,
				name: cookbooks.name,
				slug: cookbooks.slug,
				ownerUsername: users.username,
				role: cookbookEditors.role
			})
			.from(cookbookEditors)
			.innerJoin(cookbooks, eq(cookbooks.id, cookbookEditors.cookbookId))
			.innerJoin(users, eq(users.id, cookbooks.ownerId))
			.where(and(eq(cookbookEditors.userId, userId), isNull(cookbooks.deletedAt)))
			.orderBy(asc(cookbookEditors.role), asc(cookbooks.createdAt))
	).map((row) => ({ ...row, ownerUsername: row.ownerUsername ?? '' }));

export const getEditorRole = async (db: Database, cookbookId: string, userId: string) =>
	(
		await db.query.cookbookEditors.findFirst({
			where: and(eq(cookbookEditors.cookbookId, cookbookId), eq(cookbookEditors.userId, userId))
		})
	)?.role ?? null;

/** The current slug of a cookbook that was renamed or moved to another owner */
export const findMovedCookbook = async (db: Database, ownerId: string, oldSlug: string) => {
	const [row] = await db
		.select({ slug: cookbooks.slug, username: users.username })
		.from(cookbookSlugHistory)
		.innerJoin(cookbooks, eq(cookbooks.id, cookbookSlugHistory.cookbookId))
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(and(eq(cookbookSlugHistory.ownerId, ownerId), eq(cookbookSlugHistory.oldSlug, oldSlug)));
	return row;
};
