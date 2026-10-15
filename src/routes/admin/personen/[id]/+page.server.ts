import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { deleteAccount, isLastAdmin, signOutEverywhere } from '#lib/server/accounts.js';
import { requireAdmin } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';
import { reportCases, reports, users } from '#lib/server/db/schema.js';
import { renderMail, sendMail } from '#lib/server/mail.js';
import { audit } from '#lib/server/moderation/audit.js';
import { banUser, unbanUser } from '#lib/server/moderation/decisions.js';
import { storageUsage } from '#lib/server/storageUsage.js';
import { changeUsername, isUsernameAvailable } from '#lib/server/users.js';
import { validateUsername } from '#lib/username.js';
import { revalidate } from '#lib/server/revalidate.js';

const loadPerson = async (id: string) => {
	const person = await getDb().query.users.findFirst({ where: eq(users.id, id) });
	if (!person) error(404, 'Diese Person gibt es nicht');
	return person;
};

export async function load(event) {
	await requireAdmin(event);
	const db = getDb();
	const person = await loadPerson(event.params.id);
	const [cookbooks, used, [reportsBy], casesAgainst] = await Promise.all([
		listEditableCookbooks(db, person.id),
		storageUsage(db, person.id),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(reports)
			.where(eq(reports.reporterUserId, person.id)),
		db
			.select({ id: reportCases.id, status: reportCases.status, decision: reportCases.decision })
			.from(reportCases)
			.where(and(eq(reportCases.targetType, 'user'), eq(reportCases.targetId, person.id)))
	]);
	return {
		person: {
			id: person.id,
			name: person.name,
			username: person.username,
			email: person.email,
			role: person.role,
			banned: Boolean(person.banned),
			banReason: person.banReason,
			unreliableReporter: person.unreliableReporter,
			storageLimitMb: Math.round(person.storageLimitBytes / 1024 / 1024),
			createdAt: person.createdAt
		},
		cookbooks,
		storageUsedMb: Math.round((used / 1024 / 1024) * 10) / 10,
		reportsBy: reportsBy.count,
		casesAgainst
	};
}

const context = (event: RequestEvent, adminId: string) => ({
	db: getDb(),
	storage: getStorage(),
	origin: event.url.origin,
	adminId
});

const reasonOf = async (event: RequestEvent) => {
	const reason = String((await event.request.formData()).get('reason') ?? '').trim();
	return reason || null;
};

export const actions = {
	save: async (event) => {
		const admin = await requireAdmin(event);
		const db = getDb();
		const before = await loadPerson(event.params.id);
		const form = await event.request.formData();
		const values = {
			name: String(form.get('name') ?? '').trim(),
			username: String(form.get('username') ?? '')
				.trim()
				.toLowerCase(),
			email: String(form.get('email') ?? '')
				.trim()
				.toLowerCase(),
			role: form.get('role') === 'admin' ? 'admin' : 'user',
			storageLimitBytes: Math.max(0, Number(form.get('storageLimitMb')) || 0) * 1024 * 1024,
			unreliableReporter: form.get('unreliableReporter') === 'on'
		};
		if (!values.name) return fail(400, { error: 'Der Name fehlt.' });
		if (!z.email().safeParse(values.email).success)
			return fail(400, { error: 'Ungültige E-Mail.' });
		const usernameError = validateUsername(values.username);
		if (usernameError) return fail(400, { error: usernameError });
		if (values.role !== 'admin' && (await isLastAdmin(db, before.id))) {
			return fail(400, { error: 'Der letzte Admin kann seine Rolle nicht abgeben.' });
		}
		if (values.username !== before.username) {
			if (!(await isUsernameAvailable(db, values.username, before.id))) {
				return fail(400, { error: 'Dieser Benutzername ist vergeben.' });
			}
			await changeUsername(db, before.id, values.username);
			await revalidate(event.url.origin, [`/@${before.username}`, `/@${values.username}`]);
		}
		await db
			.update(users)
			.set({
				name: values.name,
				email: values.email,
				role: values.role,
				storageLimitBytes: values.storageLimitBytes,
				unreliableReporter: values.unreliableReporter
			})
			.where(eq(users.id, before.id));
		await audit(db, {
			adminId: admin.id,
			action: 'user:edit',
			targetType: 'user',
			targetId: before.id,
			before: {
				name: before.name,
				username: before.username,
				email: before.email,
				role: before.role
			},
			after: values
		});
		return { saved: 'Gespeichert.' };
	},

	warn: async (event) => {
		const admin = await requireAdmin(event);
		const reason = await reasonOf(event);
		if (!reason) return fail(400, { error: 'Bitte gib einen Grund an.' });
		const person = await loadPerson(event.params.id);
		const db = getDb();
		await sendMail(
			db,
			person.email,
			renderMail({
				subject: 'Eine Verwarnung der Moderation',
				paragraphs: [
					`Hallo ${person.name},`,
					`wir mussten dich verwarnen. Begründung: ${reason}`,
					'Wenn du nicht einverstanden bist, antworte auf diese Mail.'
				]
			}),
			{ kind: 'moderation-warning', retry: true }
		);
		await audit(db, {
			adminId: admin.id,
			action: 'user:warn',
			targetType: 'user',
			targetId: person.id,
			after: { reason }
		});
		return { saved: 'Verwarnung verschickt.' };
	},

	ban: async (event) => {
		const admin = await requireAdmin(event);
		const reason = await reasonOf(event);
		if (!reason) return fail(400, { error: 'Bitte gib einen Grund an.' });
		const person = await loadPerson(event.params.id);
		if (person.role === 'admin')
			return fail(400, { error: 'Admins können nicht gesperrt werden.' });
		await banUser(context(event, admin.id), person.id, reason);
		await audit(getDb(), {
			adminId: admin.id,
			action: 'user:ban',
			targetType: 'user',
			targetId: person.id,
			after: { reason }
		});
		return { saved: 'Gesperrt.' };
	},

	unban: async (event) => {
		const admin = await requireAdmin(event);
		await unbanUser(context(event, admin.id), event.params.id);
		await audit(getDb(), {
			adminId: admin.id,
			action: 'user:unban',
			targetType: 'user',
			targetId: event.params.id
		});
		return { saved: 'Entsperrt.' };
	},

	signOut: async (event) => {
		const admin = await requireAdmin(event);
		await signOutEverywhere(getDb(), event.params.id);
		await audit(getDb(), {
			adminId: admin.id,
			action: 'user:sign-out',
			targetType: 'user',
			targetId: event.params.id
		});
		return { saved: 'Auf allen Geräten abgemeldet.' };
	},

	delete: async (event) => {
		const admin = await requireAdmin(event);
		const db = getDb();
		const person = await loadPerson(event.params.id);
		if (await isLastAdmin(db, person.id))
			return fail(400, { error: 'Der letzte Admin kann nicht gelöscht werden.' });
		await audit(db, {
			adminId: admin.id,
			action: 'user:delete',
			targetType: 'user',
			targetId: person.id,
			before: { name: person.name, username: person.username, email: person.email }
		});
		await deleteAccount(db, getStorage(), person.id);
		redirect(303, '/admin/personen');
	}
};
