import { error } from '@sveltejs/kit';
import { getAuth } from '#lib/server/auth/config.js';

/**
 * Only the endpoints the browser needs. Signing in by mail goes through the form on
 * /anmelden because of the captcha, admin functions through the admin area.
 */
const PUBLIC_ENDPOINTS = [
	'/get-session',
	'/sign-out',
	'/magic-link/verify',
	'/sign-in/passkey',
	'/passkey/',
	'/verify-email',
	'/list-sessions',
	'/revoke-other-sessions'
];

const handle = ({
	request,
	url,
	params
}: {
	request: Request;
	url: URL;
	params: { all: string };
}) => {
	const path = `/${params.all}`;
	if (!PUBLIC_ENDPOINTS.some((endpoint) => path.startsWith(endpoint))) error(404, 'Not found');
	return getAuth(url.origin).handler(request);
};

export const GET = handle;
export const POST = handle;
