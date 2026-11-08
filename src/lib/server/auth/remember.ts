import { createHmac } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { appSecret } from '../secret';

const cookieName = (url: URL) =>
	`${url.protocol === 'https:' ? '__Secure-' : ''}kochbuch.dont_remember`;

/**
 * Better Auth keeps the session cookie only for the browser session when the request that signs
 * in carries its signed `dont_remember` cookie. The sign-in form sets it before the link is used.
 */
export const setRememberChoice = (cookies: Cookies, url: URL, remember: boolean) => {
	const secure = url.protocol === 'https:';
	const name = cookieName(url);
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

/** `false` after choosing not to stay signed in, the cookie ends with the browser session */
export const readRememberChoice = (cookies: Cookies, url: URL) => !cookies.get(cookieName(url));
