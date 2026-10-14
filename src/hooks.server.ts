import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_SECRET } from '$app/env/private';
import { SESSION_COOKIE, verifySession } from '#lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
		if (!verifySession(event.cookies.get(SESSION_COOKIE), SESSION_SECRET)) {
			redirect(303, `/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
		}
	}

	return resolve(event);
};
