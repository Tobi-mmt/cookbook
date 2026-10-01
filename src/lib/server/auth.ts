import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
	password: string,
	salt: Buffer,
	keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;
export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** Creates a hash in the format `scrypt:<salt>:<hash>` (no `$`, which .env files would expand) for the ADMIN_PASSWORD_HASH env variable */
export const hashPassword = async (password: string) => {
	const salt = randomBytes(16);
	const hash = await scryptAsync(password, salt, KEY_LENGTH);
	return `scrypt:${salt.toString('base64')}:${hash.toString('base64')}`;
};

export const verifyPassword = async (password: string, storedHash: string | undefined) => {
	const [algorithm, salt, hash] = storedHash?.split(':') ?? [];
	if (algorithm !== 'scrypt' || !salt || !hash) return false;

	const expected = Buffer.from(hash, 'base64');
	const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length);
	return timingSafeEqual(actual, expected);
};

const sign = (value: string, secret: string) =>
	createHmac('sha256', secret).update(value).digest('base64url');

/** The session is just the signed expiry date, there is only one admin */
export const createSession = (secret: string, now = Date.now()) => {
	const expires = String(now + SESSION_MAX_AGE * 1000);
	return `${expires}.${sign(expires, secret)}`;
};

export const verifySession = (
	session: string | undefined,
	secret: string | undefined,
	now = Date.now()
) => {
	if (!session || !secret) return false;
	const [expires, signature] = session.split('.');
	if (!expires || !signature) return false;

	const expected = Buffer.from(sign(expires, secret));
	const actual = Buffer.from(signature);
	return (
		actual.length === expected.length && timingSafeEqual(actual, expected) && Number(expires) > now
	);
};
