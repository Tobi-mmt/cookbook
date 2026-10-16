import { fail, redirect } from '@sveltejs/kit';
import { and, eq, gt, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import {
	ACCOUNT_DELETION_DAYS,
	deletionDate,
	isLastAdmin,
	signOutEverywhere
} from '#lib/server/accounts.js';
import { createEmailChangeToken } from '#lib/server/emailChange.js';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireOwner, requireUser } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';
import { cookbooks, users } from '#lib/server/db/schema.js';
import { isSuppressed, renderMail, sendMail } from '#lib/server/mail.js';
import { hitRateLimit } from '#lib/server/rateLimit.js';
import { revalidate } from '#lib/server/revalidate.js';
import { storageStatus } from '#lib/server/storageUsage.js';
import { trashCutoff } from '#lib/server/trash.js';
import { changeUsername, isUsernameAvailable } from '#lib/server/users.js';
import { validateUsername } from '#lib/username.js';

export async function load(event) {
	const user = await requireUser(event);
	const db = getDb();
	const [row, deleted, storage, bounced] = await Promise.all([
		db.query.users.findFirst({ where: eq(users.id, user.id) }),
		db
			.select({ id: cookbooks.id, name: cookbooks.name, deletedAt: cookbooks.deletedAt })
			.from(cookbooks)
			.where(
				and(
					eq(cookbooks.ownerId, user.id),
					isNotNull(cookbooks.deletedAt),
					gt(cookbooks.deletedAt, trashCutoff())
				)
			),
		storageStatus(db, user.id),
		isSuppressed(db, user.email)
	]);
	return {
		account: {
			name: user.name,
			username: user.username,
			email: user.email,
			deletionAt: row?.deletionRequestedAt ? deletionDate(row.deletionRequestedAt) : null
		},
		deletionDays: ACCOUNT_DELETION_DAYS,
		deletedCookbooks: deleted,
		storage,
		bounced
	};
}

const HOUR = 60 * 60;

export const actions = {
	profile: async (event) => {
		const user = await requireUser(event);
		const form = await event.request.formData();
		const name = String(form.get('name') ?? '').trim();
		const username = String(form.get('username') ?? '')
			.trim()
			.toLowerCase();
		if (!name) return fail(400, { error: 'Bitte gib deinen Namen an.' });
		const usernameError = validateUsername(username);
		if (usernameError) return fail(400, { error: usernameError });

		const db = getDb();
		if (username !== user.username) {
			if (!(await isUsernameAvailable(db, username, user.id))) {
				return fail(400, { error: 'Dieser Benutzername ist leider schon vergeben.' });
			}
			await changeUsername(db, user.id, username);
		}
		await db.update(users).set({ name }).where(eq(users.id, user.id));

		const cookbookIds = (await listEditableCookbooks(db, user.id)).map(({ id }) => id);
		await revalidate(event.url.origin, [
			...(await affectedPaths(db, { cookbookIds })),
			`/@${user.username}`
		]);
		return { saved: 'Gespeichert.' };
	},

	email: async (event) => {
		const user = await requireUser(event);
		const email = String((await event.request.formData()).get('email') ?? '')
			.trim()
			.toLowerCase();
		if (!z.email().safeParse(email).success) {
			return fail(400, { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}
		if (email === user.email.toLowerCase()) {
			return fail(400, { error: 'Das ist schon die Adresse deines Kontos.' });
		}
		const db = getDb();
		if (!(await hitRateLimit(db, `email-change:${user.id}`, 5, HOUR))) {
			return fail(429, { error: 'Zu viele Versuche. Bitte warte etwas.' });
		}
		if (await db.query.users.findFirst({ where: eq(users.email, email) })) {
			return fail(400, { error: 'Diese Adresse gehört schon zu einem Konto.' });
		}
		const url = `${event.url.origin}/konto/email?token=${createEmailChangeToken(user.id, email)}`;
		await sendMail(
			db,
			email,
			renderMail({
				subject: 'Bitte bestätige deine neue E-Mail-Adresse',
				paragraphs: [
					`Hallo ${user.name},`,
					'bestätige mit diesem Link, dass du diese Adresse für dein Konto verwenden möchtest. Er ist 24 Stunden gültig.'
				],
				button: { label: 'Adresse bestätigen', url }
			}),
			{ kind: 'email-change' }
		);
		return { saved: `Wir haben einen Bestätigungslink an ${email} geschickt.` };
	},

	signOutOthers: async (event) => {
		const user = await requireUser(event);
		await signOutEverywhere(getDb(), user.id);
		redirect(303, '/anmelden');
	},

	restoreCookbook: async (event) => {
		const id = String((await event.request.formData()).get('id'));
		await requireOwner(event, id);
		const db = getDb();
		await db.update(cookbooks).set({ deletedAt: null }).where(eq(cookbooks.id, id));
		await revalidate(event.url.origin, await affectedPaths(db, { cookbookIds: [id] }));
		return { saved: 'Das Kochbuch ist wieder da.' };
	},

	requestDeletion: async (event) => {
		const user = await requireUser(event);
		const db = getDb();
		if (await isLastAdmin(db, user.id)) {
			return fail(400, { error: 'Als letzter Admin kannst du dein Konto nicht löschen.' });
		}
		const now = new Date();
		await db.update(users).set({ deletionRequestedAt: now }).where(eq(users.id, user.id));
		await sendMail(
			db,
			user.email,
			renderMail({
				subject: `Dein Konto wird in ${ACCOUNT_DELETION_DAYS} Tagen gelöscht`,
				paragraphs: [
					`Hallo ${user.name},`,
					`dein Konto wird am ${deletionDate(now).toLocaleDateString('de-DE')} gelöscht, zusammen mit allen Kochbüchern, die nur du bearbeitest. Rezepte in gemeinsamen Kochbüchern bleiben dort. Bis dahin kannst du das Löschen abbrechen und deine Daten herunterladen.`
				],
				button: { label: 'Konto öffnen', url: `${event.url.origin}/konto` }
			}),
			{ kind: 'account-deletion' }
		);
		return { saved: `Dein Konto wird in ${ACCOUNT_DELETION_DAYS} Tagen gelöscht.` };
	},

	cancelDeletion: async (event) => {
		const user = await requireUser(event);
		await getDb().update(users).set({ deletionRequestedAt: null }).where(eq(users.id, user.id));
		return { saved: 'Das Löschen ist abgebrochen.' };
	}
};
