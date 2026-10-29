import { describe, expect, test } from 'vitest';
import { pageViews, users } from './db/schema';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestUser } from './testing/fixtures';
import { buildWeeklyReport, compare, lastWeeks } from './weeklyReport';
import { eq } from 'drizzle-orm';

describe('lastWeeks', () => {
	test('are the full weeks before the current one, in German time', () => {
		expect(lastWeeks(new Date('2026-10-26T01:30:00Z'))).toEqual({
			current: { from: '2026-10-19', to: '2026-10-25' },
			previous: { from: '2026-10-12', to: '2026-10-18' }
		});
		expect(lastWeeks(new Date('2026-11-01T12:00:00Z')).current).toEqual({
			from: '2026-10-19',
			to: '2026-10-25'
		});
	});
});

describe('compare', () => {
	test('shows the difference to the week before', () => {
		expect(compare(12, 10)).toBe('12 (Vorwoche 10, +2 bzw. +20 %)');
		expect(compare(3, 0)).toBe('3 (Vorwoche 0, +3)');
		expect(compare(5, 10)).toBe('5 (Vorwoche 10, -5 bzw. -50 %)');
	});
});

describe.skipIf(!hasTestDatabase)('buildWeeklyReport', () => {
	const handle = useTestDatabase();

	test('counts accounts and page views of both weeks and the top pages', async () => {
		const { db } = handle;
		const [a, b, c] = [
			await createTestUser(db),
			await createTestUser(db),
			await createTestUser(db)
		];
		await db
			.update(users)
			.set({ createdAt: new Date('2026-10-20T10:00:00Z') })
			.where(eq(users.id, a.id));
		await db
			.update(users)
			.set({ createdAt: new Date('2026-10-21T10:00:00Z') })
			.where(eq(users.id, b.id));
		await db
			.update(users)
			.set({ createdAt: new Date('2026-10-13T10:00:00Z') })
			.where(eq(users.id, c.id));
		const view = (day: string, path: string, visitorHash: string) => ({ day, path, visitorHash });
		await db
			.insert(pageViews)
			.values([
				view('2026-10-20', '/', 'x'),
				view('2026-10-20', '/', 'x'),
				view('2026-10-21', '/', 'x'),
				view('2026-10-21', '/rezepte', 'y'),
				view('2026-10-14', '/', 'z')
			]);

		const report = await buildWeeklyReport(db, new Date('2026-10-26T01:30:00Z'));
		expect(report.thisWeek).toEqual({ accounts: 2, recipes: 0, pageViews: 4, visitors: 3 });
		expect(report.lastWeek).toEqual({ accounts: 1, recipes: 0, pageViews: 1, visitors: 1 });
		expect(report.top).toEqual([
			{ path: '/', views: 3, title: 'Startseite' },
			{ path: '/rezepte', views: 1, title: undefined }
		]);
	});
});
