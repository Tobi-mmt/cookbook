import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE, verifySession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
		if (!verifySession(event.cookies.get(SESSION_COOKIE), env.SESSION_SECRET)) {
			redirect(303, `/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
		}
	}

	return resolve(event);
};
