import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireAdmin } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import {
	listMembers,
	removeEditor,
	renameCookbook,
	transferCookbook
} from '#lib/server/cookbooks.js';
import { cookbooks, users } from '#lib/server/db/schema.js';
import {
	acceptInvitation,
	listOpenInvitations,
	revokeInvitation
} from '#lib/server/invitations.js';
import { audit } from '#lib/server/moderation/audit.js';
import { setHidden } from '#lib/server/moderation/decisions.js';
import { revalidate } from '#lib/server/revalidate.js';

const loadCookbook = async (id: string) => {
	const cookbook = await getDb().query.cookbooks.findFirst({ where: eq(cookbooks.id, id) });
	if (!cookbook) error(404, 'Dieses Kochbuch gibt es nicht');
	return cookbook;
};

export async function load(event) {
	await requireAdmin(event);
	const cookbook = await loadCookbook(event.params.id);
	const db = getDb();
	const [members, invitations] = await Promise.all([
		listMembers(db, cookbook.id),
		listOpenInvitations(db, cookbook.id)
	]);
	return { cookbook, members, invitations };
}

/** Every admin change revalidates the pages and goes into the audit log */
const change = async (
	event: RequestEvent<{ id: string }>,
	action: string,
	run: (form: FormData, adminId: string) => Promise<string | { error: string } | void>
) => {
	const admin = await requireAdmin(event);
	const db = getDb();
	const before = await loadCookbook(event.params.id);
	const form = await event.request.formData();
	const paths = await affectedPaths(db, { cookbookIds: [before.id] });
	const result = await run(form, admin.id);
	if (result && typeof result === 'object') return fail(400, result);
	const after = await loadCookbook(event.params.id);
	await audit(db, {
		adminId: admin.id,
		action,
		targetType: 'cookbook',
		targetId: before.id,
		before,
		after
	});
	await revalidate(event.url.origin, [
		...paths,
		...(await affectedPaths(db, { cookbookIds: [before.id] }))
	]);
	return { saved: result ?? 'Gespeichert.' };
};

export const actions = {
	rename: (event) =>
		change(event, 'cookbook:rename', async (form) => {
			const name = String(form.get('name') ?? '').trim();
			if (!name) return { error: 'Der Name fehlt.' };
			await renameCookbook(getDb(), event.params.id, name);
		}),
	transfer: (event) =>
		change(event, 'cookbook:transfer', async (form) => {
			const userId = String(form.get('userId'));
			const members = await listMembers(getDb(), event.params.id);
			if (!members.some((member) => member.userId === userId && member.role === 'editor')) {
				return { error: 'Diese Person bearbeitet das Kochbuch nicht.' };
			}
			await transferCookbook(getDb(), event.params.id, userId);
		}),
	addEditor: (event) =>
		change(event, 'cookbook:add-editor', async (form) => {
			const username = String(form.get('username') ?? '')
				.trim()
				.replace(/^@/, '')
				.toLowerCase();
			const user = await getDb().query.users.findFirst({ where: eq(users.username, username) });
			if (!user) return { error: 'Diese Person gibt es nicht.' };
			await acceptInvitation(getDb(), event.params.id, user.id);
		}),
	removeEditor: (event) =>
		change(event, 'cookbook:remove-editor', async (form) => {
			await removeEditor(getDb(), event.params.id, String(form.get('userId')));
		}),
	revoke: (event) =>
		change(event, 'cookbook:revoke-invitation', async (form) => {
			await revokeInvitation(getDb(), event.params.id, String(form.get('id')));
		}),
	hide: (event) =>
		change(event, 'cookbook:hide', async (form, adminId) => {
			const reason = String(form.get('reason') ?? '').trim();
			if (!reason) return { error: 'Bitte gib einen Grund an.' };
			await setHidden(
				{ db: getDb(), storage: getStorage(), origin: event.url.origin, adminId },
				'cookbook',
				event.params.id,
				reason
			);
			return 'Ausgeblendet.';
		}),
	unhide: (event) =>
		change(event, 'cookbook:unhide', async (_form, adminId) => {
			await setHidden(
				{ db: getDb(), storage: getStorage(), origin: event.url.origin, adminId },
				'cookbook',
				event.params.id,
				null
			);
			return 'Wieder sichtbar.';
		}),
	delete: (event) =>
		change(event, 'cookbook:delete', async () => {
			await getDb()
				.update(cookbooks)
				.set({ deletedAt: new Date() })
				.where(eq(cookbooks.id, event.params.id));
			return 'In den Papierkorb gelegt.';
		}),
	restore: (event) =>
		change(event, 'cookbook:restore', async () => {
			await getDb()
				.update(cookbooks)
				.set({ deletedAt: null })
				.where(eq(cookbooks.id, event.params.id));
			return 'Wiederhergestellt.';
		})
};
