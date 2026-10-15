import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/sha';
import { describe, expect, test, vi } from 'vitest';
import type { Database } from './db/client';

const used = new Set<string>();
vi.mock('./rateLimit', () => ({
	hitRateLimit: async (_db: unknown, key: string) => !used.has(key) && Boolean(used.add(key))
}));

const { createCaptchaChallenge, verifyCaptcha } = await import('./captcha');
const db = {} as Database;

const solve = async () => {
	const challenge = await createCaptchaChallenge();
	const solution = await solveChallenge({ challenge, deriveKey });
	return { challenge, solution: solution! };
};
const encode = (value: unknown) => btoa(JSON.stringify(value));

describe('captcha', () => {
	test('accepts a solved challenge once', async () => {
		const payload = encode(await solve());
		expect(await verifyCaptcha(db, payload)).toBe(true);
		expect(await verifyCaptcha(db, payload)).toBe(false);
	});

	test('rejects wrong solutions and junk', async () => {
		const { challenge, solution } = await solve();
		expect(
			await verifyCaptcha(db, encode({ challenge, solution: { ...solution, counter: 1 } }))
		).toBe(false);
		expect(await verifyCaptcha(db, 'junk')).toBe(false);
		expect(await verifyCaptcha(db, undefined)).toBe(false);
	});
});
