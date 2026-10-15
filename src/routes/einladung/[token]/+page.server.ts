import { error, redirect } from '@sveltejs/kit';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireUser } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { getEditorRole } from '#lib/server/cookbooks.js';
import { acceptInvitation, findInvitation } from '#lib/server/invitations.js';
import { revalidate } from '#lib/server/revalidate.js';

export async function load({ params, locals }) {
	const db = getDb();
	const found = await findInvitation(db, params.token);
	if (!found) error(404, 'Diese Einladung gibt es nicht');

	const session = await locals.getSession();
	const cookbookUrl = `/@${found.ownerUsername}/${found.cookbook.slug}`;
	if (session && (await getEditorRole(db, found.cookbook.id, session.user.id))) {
		redirect(303, cookbookUrl);
	}
	return {
		usable: found.usable,
		signedIn: Boolean(session),
		cookbook: { name: found.cookbook.name, ownerUsername: found.ownerUsername }
	};
}

export const actions = {
	default: async (event) => {
		const user = await requireUser(event);
		const db = getDb();
		const found = await findInvitation(db, event.params.token);
		if (!found?.usable) error(410, 'Diese Einladung ist abgelaufen oder wurde widerrufen');

		await acceptInvitation(db, found.cookbook.id, user.id);
		await revalidate(
			event.url.origin,
			await affectedPaths(db, { cookbookIds: [found.cookbook.id] })
		);
		redirect(303, `/@${found.ownerUsername}/${found.cookbook.slug}`);
	}
};
