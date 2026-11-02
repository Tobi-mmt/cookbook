import { describe, expect, test } from 'vitest';
import { pageViews, users } from './db/schema';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestUser } from './testing/fixtures';
import {
	buildWeeklyReport,
	change,
	lastWeeks,
	pageLabel,
	renderWeeklyReport
} from './weeklyReport';
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

describe('change', () => {
	test('shows the difference in percent', () => {
		expect(change(12, 10)).toEqual({ label: '+20 %', tone: 'up' });
		expect(change(5, 10)).toEqual({ label: '−50 %', tone: 'down' });
		expect(change(3, 0)).toEqual({ label: 'neu', tone: 'up' });
		expect(change(4, 4)).toEqual({ label: '±0', tone: 'same' });
	});
});

describe('pageLabel', () => {
	test('names pages instead of showing paths', () => {
		expect(pageLabel('/rezept/abc/Dal', 'Dal')).toBe('Dal');
		expect(pageLabel('/')).toBe('Startseite');
		expect(pageLabel('/rezepte/mit/rote-linsen')).toBe('Rezepte mit Rote linsen');
		expect(pageLabel('/rezepte/vegan')).toBe('Vegan');
		expect(pageLabel('/@tobi/unser-kochbuch')).toBe('@tobi/unser-kochbuch');
	});
});

describe('renderWeeklyReport', () => {
	test('names the previous week once and links the pages', () => {
		const mail = renderWeeklyReport(
			{
				current: { from: '2026-10-19', to: '2026-10-25' },
				previous: { from: '2026-10-12', to: '2026-10-18' },
				thisWeek: { accounts: 4, recipes: 7, pageViews: 1830, visitors: 412 },
				lastWeek: { accounts: 2, recipes: 9, pageViews: 1500, visitors: 380 },
				top: [{ path: '/rezept/abc/Dal', views: 140, title: 'Dal' }]
			},
			'https://kochbuchbande.de'
		);
		expect(mail.subject).toBe('Wochenbericht 19.–25.10.: 412 Besucher (+8 %)');
		expect(mail.html.match(/Vorwoche/g)).toHaveLength(1);
		expect(mail.html).toContain('href="https://kochbuchbande.de/rezept/abc/Dal"');
		expect(mail.html).not.toContain('>/rezept/abc/Dal<');
		expect(mail.text).toContain('Besucher: 412 (380, +8 %)');
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
