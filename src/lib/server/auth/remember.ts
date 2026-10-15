import { createHmac } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { appSecret } from '../secret';

/**
 * Better Auth keeps the session cookie only for the browser session when the request that signs
 * in carries its signed `dont_remember` cookie. The sign-in form sets it before the link is used.
 */
export const setRememberChoice = (cookies: Cookies, url: URL, remember: boolean) => {
	const secure = url.protocol === 'https:';
	const name = `${secure ? '__Secure-' : ''}kochbuch.dont_remember`;
	if (remember) {
		cookies.delete(name, { path: '/', secure });
		return;
	}
	const signature = createHmac('sha256', appSecret()).update('true').digest('base64');
	cookies.set(name, `true.${signature}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure
	});
};
