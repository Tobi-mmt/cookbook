import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword } from '$lib/server/auth';

const safeRedirectTarget = (target: string | null) =>
	target?.startsWith('/admin') && !target.startsWith('//') ? target : '/admin';

export const actions = {
	default: async ({ request, cookies, url }) => {
		const password = String((await request.formData()).get('password') ?? '');

		if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
			return fail(500, { error: 'ADMIN_PASSWORD_HASH oder SESSION_SECRET ist nicht gesetzt.' });
		}
		if (!(await verifyPassword(password, env.ADMIN_PASSWORD_HASH))) {
			// slows down guessing
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return fail(401, { error: 'Falsches Passwort.' });
		}

		cookies.set(SESSION_COOKIE, createSession(env.SESSION_SECRET), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});
		redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo')));
	}
};
