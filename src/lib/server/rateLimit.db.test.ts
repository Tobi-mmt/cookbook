import { describe, expect, test } from 'vitest';
import { hitRateLimit } from './rateLimit';
import { hasTestDatabase, useTestDatabase } from './testing/db';

describe.skipIf(!hasTestDatabase)('hitRateLimit', () => {
	const handle = useTestDatabase();

	test('allows the limit within a window and starts over after it', async () => {
		const start = new Date('2026-01-01T10:00:00Z');
		const hit = (seconds: number) =>
			hitRateLimit(handle.db, 'test', 2, 60, new Date(start.getTime() + seconds * 1000));
		expect([await hit(0), await hit(10), await hit(20)]).toEqual([true, true, false]);
		expect(await hit(61)).toBe(true);
	});
});
