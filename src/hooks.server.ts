import { error, redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { eq } from 'drizzle-orm';
import { dev } from '$app/env';
import { loadSession } from '#lib/server/auth/session.js';
import { getDb } from '#lib/server/context.js';
import { users } from '#lib/server/db/schema.js';
import { findRenamedUsername } from '#lib/server/users.js';

/** `/tobi` leads to `/@tobi` as long as there is no page with that name */
const profileRedirect = async (pathname: string) => {
	const username = pathname.match(/^\/([a-zA-Z0-9-]{3,30})\/?$/)?.[1]?.toLowerCase();
	if (!username) return null;
	const db = getDb();
	const user = await db.query.users.findFirst({
		where: eq(users.username, username),
		columns: { username: true }
	});
	return user?.username ?? (await findRenamedUsername(db, username));
};

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	let session: ReturnType<typeof loadSession> | undefined;
	event.locals.getSession = () => (session ??= loadSession(event));

	// the admin area needs the admin role and a sign-in with a passkey, also for its actions
	if (pathname.startsWith('/admin')) {
		const current = await event.locals.getSession();
		if (!current) redirect(303, `/anmelden?weiter=${encodeURIComponent(pathname)}`);
		if (current.user.role !== 'admin') error(403, 'Nur für Admins');
		if (!dev && current.authMethod !== 'passkey' && pathname !== '/admin/passkey') {
			redirect(303, '/admin/passkey');
		}
	}

	const response = await resolve(event);
	if (response.status === 404 && event.request.method === 'GET') {
		const username = await profileRedirect(pathname);
		if (username) redirect(308, `/@${username}`);
	}
	return response;
};
