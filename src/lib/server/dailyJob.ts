import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { deleteRequestedAccounts } from './accounts';
import { closeCasesOfDeletedTargets, sendDailyReportSummary } from './moderation/reports';
import { affectedPaths } from './affectedPaths';
import type { Database } from './db/client';
import { cookbookEditors, mailLog, users } from './db/schema';
import { renderMail, resendPendingMails, sendMail } from './mail';
import { deleteExpiredRateLimits, hitRateLimit } from './rateLimit';
import { addDays, aggregateDailyViews, deleteOldPageViews } from './recipeViews';
import { LIST_PATHS, revalidate } from './revalidate';
import type { Storage } from './storage';
import { trackingDay } from './tracking';
import { purgeTrash } from './trash';

const MAIL_WARNING_THRESHOLD = 1000;

/** Pages of accounts that just turned 14 days old and may be indexed now */
const newlyIndexablePaths = async (db: Database, now: Date) => {
	const day = 24 * 60 * 60 * 1000;
	const grown = await db
		.select({ id: users.id })
		.from(users)
		.where(
			and(
				lt(users.createdAt, new Date(now.getTime() - 14 * day)),
				gte(users.createdAt, new Date(now.getTime() - 15 * day))
			)
		);
	if (!grown.length) return [];
	const memberships = await db
		.selectDistinct({ cookbookId: cookbookEditors.cookbookId })
		.from(cookbookEditors)
		.where(
			inArray(
				cookbookEditors.userId,
				grown.map(({ id }) => id)
			)
		);
	return affectedPaths(db, { cookbookIds: memberships.map(({ cookbookId }) => cookbookId) });
};

const warnAboutMailVolume = async (db: Database, now: Date) => {
	const month = now.toISOString().slice(0, 7);
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(mailLog)
		.where(gte(mailLog.createdAt, new Date(`${month}-01T00:00:00Z`)));
	if (count < MAIL_WARNING_THRESHOLD) return;
	if (!(await hitRateLimit(db, `mail-warning:${month}`, 1, 40 * 24 * 60 * 60))) return;

	const admins = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
	for (const { email } of admins) {
		await sendMail(
			db,
			email,
			renderMail({
				subject: `Schon ${count} Mails in diesem Monat`,
				paragraphs: [
					`In diesem Monat wurden schon ${count} Mails verschickt. 300 sind bei Scaleway kostenlos, danach kosten 1.000 Mails 0,25 €. Bitte prüfe, ob jemand die Anmeldung missbraucht.`
				]
			}),
			{ kind: 'admin-warning', retry: true }
		);
	}
};

/**
 * The nightly maintenance: daily view numbers, retention of raw data, trash, account
 * deletions, pending mails. Each step runs even if another one fails.
 */
export const runDailyJob = async (
	db: Database,
	storage: Storage,
	{ origin, now = new Date() }: { origin: string; now?: Date }
) => {
	const today = trackingDay(now);
	const results: Record<string, unknown> = {};
	const step = async (name: string, run: () => Promise<unknown>) => {
		try {
			results[name] = (await run()) ?? 'ok';
		} catch (error) {
			console.error(`Daily job step ${name} failed`, error);
			results[name] = 'failed';
		}
	};

	await step('views', async () => {
		for (const day of [addDays(today, -2), addDays(today, -1), today]) {
			await aggregateDailyViews(db, day);
		}
	});
	await step('pageViewRetention', async () => (await deleteOldPageViews(db, now)).rowCount);
	await step('trash', () => purgeTrash(db, storage, now));
	await step('accounts', () => deleteRequestedAccounts(db, storage, now));
	await step('mails', () => resendPendingMails(db));
	await step('mailVolume', () => warnAboutMailVolume(db, now));
	await step('closedCases', () => closeCasesOfDeletedTargets(db));
	await step('reportSummary', () => sendDailyReportSummary(db, origin, now));
	await step('rateLimits', async () => (await deleteExpiredRateLimits(db, now)).rowCount);
	await step('revalidate', async () =>
		revalidate(origin, [...LIST_PATHS, ...(await newlyIndexablePaths(db, now))])
	);
	return results;
};
