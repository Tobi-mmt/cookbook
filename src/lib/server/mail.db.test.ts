import { describe, expect, test } from 'vitest';
import { mailLog } from './db/schema';
import { deleteOldMailLog } from './mail';
import { hasTestDatabase, useTestDatabase } from './testing/db';

describe.skipIf(!hasTestDatabase)('deleteOldMailLog', () => {
	const handle = useTestDatabase();

	test('keeps the mails of the last 90 days', async () => {
		const { db } = handle;
		const now = new Date('2026-10-16T12:00:00Z');
		await db.insert(mailLog).values([
			{
				recipient: 'alt@example.com',
				kind: 'magic-link',
				status: 'sent',
				createdAt: new Date('2026-07-17T11:00:00Z')
			},
			{
				recipient: 'neu@example.com',
				kind: 'magic-link',
				status: 'sent',
				createdAt: new Date('2026-07-18T13:00:00Z')
			}
		]);

		await deleteOldMailLog(db, now);

		expect(
			(await db.select({ recipient: mailLog.recipient }).from(mailLog)).map(
				({ recipient }) => recipient
			)
		).toEqual(['neu@example.com']);
	});
});
