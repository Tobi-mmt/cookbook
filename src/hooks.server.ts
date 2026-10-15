import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_SECRET } from '$app/env/private';
import { SESSION_COOKIE, verifySession } from '#lib/server/auth.js';
import { loadSession } from '#lib/server/auth/session.js';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	let session: ReturnType<typeof loadSession> | undefined;
	event.locals.getSession = () => (session ??= loadSession(event));

	if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
		if (!verifySession(event.cookies.get(SESSION_COOKIE), SESSION_SECRET)) {
			redirect(303, `/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
		}
	}

	return resolve(event);
};
