import { createHash, randomBytes } from 'node:crypto';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type { Database } from './db/client';
import { cookbookEditors, cookbooks, invitations, users } from './db/schema';
import { createId } from './ids';

const VALID_DAYS = 7;

const hashToken = (token: string) => createHash('sha256').update(token).digest('base64url');

/** Links can be used several times and by anybody who has them, until they expire or are revoked */
export const createInvitation = async (
	db: Database,
	{ cookbookId, createdBy, email }: { cookbookId: string; createdBy: string; email?: string }
) => {
	const token = randomBytes(24).toString('base64url');
	await db.insert(invitations).values({
		id: createId(),
		cookbookId,
		tokenHash: hashToken(token),
		email: email || null,
		createdBy,
		expiresAt: new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000)
	});
	return token;
};

export const findInvitation = async (db: Database, token: string) => {
	const [row] = await db
		.select({
			invitation: invitations,
			cookbook: {
				id: cookbooks.id,
				name: cookbooks.name,
				slug: cookbooks.slug,
				deletedAt: cookbooks.deletedAt
			},
			ownerUsername: users.username
		})
		.from(invitations)
		.innerJoin(cookbooks, eq(cookbooks.id, invitations.cookbookId))
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(eq(invitations.tokenHash, hashToken(token)));
	if (!row) return null;
	const usable =
		!row.invitation.revokedAt && row.invitation.expiresAt > new Date() && !row.cookbook.deletedAt;
	return { ...row, ownerUsername: row.ownerUsername ?? '', usable };
};

export const listOpenInvitations = (db: Database, cookbookId: string) =>
	db
		.select({
			id: invitations.id,
			email: invitations.email,
			createdAt: invitations.createdAt,
			expiresAt: invitations.expiresAt
		})
		.from(invitations)
		.where(
			and(
				eq(invitations.cookbookId, cookbookId),
				isNull(invitations.revokedAt),
				gt(invitations.expiresAt, new Date())
			)
		)
		.orderBy(desc(invitations.createdAt));

export const revokeInvitation = (db: Database, cookbookId: string, id: string) =>
	db
		.update(invitations)
		.set({ revokedAt: new Date() })
		.where(and(eq(invitations.id, id), eq(invitations.cookbookId, cookbookId)));

export const acceptInvitation = (db: Database, cookbookId: string, userId: string) =>
	db.insert(cookbookEditors).values({ cookbookId, userId, role: 'editor' }).onConflictDoNothing();
