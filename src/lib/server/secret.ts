import { createHmac } from 'node:crypto';
import { dev } from '$app/env';
import { BETTER_AUTH_SECRET } from '$app/env/private';

export const appSecret = () => {
	if (BETTER_AUTH_SECRET) return BETTER_AUTH_SECRET;
	if (dev) return 'only-for-local-development-not-secret';
	throw new Error('BETTER_AUTH_SECRET is not set');
};

/** A keyed hash, so that rate limits and reports never store an IP address */
export const hashIp = (ip: string) =>
	createHmac('sha256', appSecret()).update(ip).digest('base64url').slice(0, 22);
