import { createChallenge, verifySolution, type Challenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/sha';
import type { Database } from './db/client';
import { hitRateLimit } from './rateLimit';
import { appSecret } from './secret';

const VALID_MINUTES = 10;

/** Proof of work without a third party: the browser searches a hash with a given prefix */
export const createCaptchaChallenge = () =>
	createChallenge({
		algorithm: 'SHA-256',
		cost: 1,
		keyPrefix: '0000',
		deriveKey,
		hmacSignatureSecret: appSecret(),
		expiresAt: new Date(Date.now() + VALID_MINUTES * 60 * 1000)
	});

/** Each solution counts once, so that one solved challenge cannot be replayed */
export const verifyCaptcha = async (db: Database, payload: unknown) => {
	if (typeof payload !== 'string' || !payload) return false;
	let parsed: { challenge: Challenge; solution: { counter: number; derivedKey: string } };
	try {
		parsed = JSON.parse(atob(payload));
	} catch {
		return false;
	}
	const result = await verifySolution({
		challenge: parsed.challenge,
		solution: parsed.solution,
		deriveKey,
		hmacSignatureSecret: appSecret()
	}).catch(() => null);
	if (!result?.verified || !parsed.challenge.signature) return false;
	return hitRateLimit(db, `captcha:${parsed.challenge.signature}`, 1, VALID_MINUTES * 60);
};
