import { createHmac, timingSafeEqual } from 'node:crypto';
import { appSecret } from './secret';

const EMAIL_LINK_HOURS = 24;

const sign = (value: string) => createHmac('sha256', appSecret()).update(value).digest('base64url');

/** A link that confirms a new mail address, signed so that it needs no table */
export const createEmailChangeToken = (userId: string, email: string, now = Date.now()) => {
	const payload = Buffer.from(
		JSON.stringify({ userId, email, expires: now + EMAIL_LINK_HOURS * 60 * 60 * 1000 })
	).toString('base64url');
	return `${payload}.${sign(payload)}`;
};

export const readEmailChangeToken = (token: string, now = Date.now()) => {
	const [payload, signature] = token.split('.');
	if (!payload || !signature) return null;
	const expected = Buffer.from(sign(payload));
	const actual = Buffer.from(signature);
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
	const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
		userId: string;
		email: string;
		expires: number;
	};
	return data.expires > now ? data : null;
};
