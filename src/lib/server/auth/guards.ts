import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { getDb } from '../context';
import { getEditorRole } from '../cookbooks';
import { audit } from '../moderation/audit';

const signInUrl = (event: RequestEvent, path: string) =>
	`${path}?weiter=${encodeURIComponent(event.url.pathname + event.url.search)}`;

/** For pages that need an account, people who have not finished the registration go back there */
export const requireUser = async (event: RequestEvent) => {
	const session = await event.locals.getSession();
	if (!session) redirect(303, signInUrl(event, '/anmelden'));
	if (!session.user.username || !session.user.acceptedTermsAt) {
		redirect(303, signInUrl(event, '/willkommen'));
	}
	return { ...session.user, username: session.user.username };
};

export type Editor = Awaited<ReturnType<typeof requireUser>> & {
	cookbookRole: 'owner' | 'editor';
	/** an admin who edits a cookbook without being one of its editors */
	asAdmin: boolean;
};

/** The one check for every change to a cookbook and its recipes, admins may always */
export const requireEditor = async (event: RequestEvent, cookbookId: string): Promise<Editor> => {
	const user = await requireUser(event);
	const role = await getEditorRole(getDb(), cookbookId, user.id);
	if (role) return { ...user, cookbookRole: role, asAdmin: false };
	if (user.role === 'admin') {
		// changes of admins to cookbooks they do not edit themselves are logged
		if (event.request.method !== 'GET') {
			await audit(getDb(), {
				adminId: user.id,
				action: 'admin:edit',
				targetType: 'cookbook',
				targetId: cookbookId,
				after: { path: event.url.pathname + event.url.search }
			});
		}
		return { ...user, cookbookRole: 'owner', asAdmin: true };
	}
	error(403, 'Du darfst dieses Kochbuch nicht bearbeiten.');
};

export const requireOwner = async (event: RequestEvent, cookbookId: string) => {
	const editor = await requireEditor(event, cookbookId);
	if (editor.cookbookRole !== 'owner') error(403, 'Das darf nur der Besitzer des Kochbuchs.');
	return editor;
};

/** Admin actions check again, `src/hooks.server.ts` already guards all of /admin */
export const requireAdmin = async (event: RequestEvent) => {
	const user = await requireUser(event);
	if (user.role !== 'admin') error(403, 'Nur für Admins');
	return user;
};
