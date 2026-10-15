import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_SECRET } from '$app/env/private';
import { SESSION_COOKIE, verifySession } from '#lib/server/auth.js';
import { loadSession } from '#lib/server/auth/session.js';
import { getDb } from '#lib/server/context.js';
import { users } from '#lib/server/db/schema.js';
import { findRenamedUsername } from '#lib/server/users.js';
import { eq } from 'drizzle-orm';

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

	if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
		if (!verifySession(event.cookies.get(SESSION_COOKIE), SESSION_SECRET)) {
			redirect(303, `/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
		}
	}

	const response = await resolve(event);
	if (response.status === 404 && event.request.method === 'GET') {
		const username = await profileRedirect(pathname);
		if (username) redirect(308, `/@${username}`);
	}
	return response;
};
