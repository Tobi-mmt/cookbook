import { describe, expect, test } from 'vitest';
import {
	createSession,
	hashPassword,
	SESSION_MAX_AGE,
	verifyPassword,
	verifySession
} from './auth';

describe('password', () => {
	test('verifies the password against its hash', async () => {
		const hash = await hashPassword('geheim');
		expect(hash).not.toContain('$');
		expect(await verifyPassword('geheim', hash)).toBe(true);
		expect(await verifyPassword('falsch', hash)).toBe(false);
	});

	test('rejects missing or malformed hashes', async () => {
		expect(await verifyPassword('geheim', undefined)).toBe(false);
		expect(await verifyPassword('geheim', 'plain-text')).toBe(false);
	});
});

describe('session', () => {
	const secret = 'test-secret';

	test('accepts a fresh session', () => {
		expect(verifySession(createSession(secret), secret)).toBe(true);
	});

	test('rejects expired sessions', () => {
		const now = Date.now();
		const session = createSession(secret, now);
		expect(verifySession(session, secret, now + SESSION_MAX_AGE * 1000 + 1)).toBe(false);
	});

	test('expires after one day', () => {
		const now = Date.now();
		const session = createSession(secret, now);
		expect(verifySession(session, secret, now + 23 * 60 * 60 * 1000)).toBe(true);
		expect(verifySession(session, secret, now + 24 * 60 * 60 * 1000 + 1)).toBe(false);
	});

	test('rejects sessions that last longer than the maximum age', () => {
		const now = Date.now();
		const session = createSession(secret, now - 1000 + 30 * SESSION_MAX_AGE * 1000);
		expect(verifySession(session, secret, now)).toBe(false);
	});

	test('rejects manipulated sessions and other secrets', () => {
		const [expires, signature] = createSession(secret).split('.');
		expect(verifySession(`${Number(expires) + 1000}.${signature}`, secret)).toBe(false);
		expect(verifySession(createSession('other'), secret)).toBe(false);
		expect(verifySession(undefined, secret)).toBe(false);
		expect(verifySession(createSession(secret), undefined)).toBe(false);
	});
});
