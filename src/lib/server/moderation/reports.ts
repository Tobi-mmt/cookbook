import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { REPORT_REASON_OPTIONS, type ReportTarget } from '../../reportReasons';
import type { Database } from '../db/client';
import { REPORT_REASONS, reportCases, reports, users } from '../db/schema';
import { renderMail, sendMail } from '../mail';
import { loadTarget } from './targets';

/** Copyright and dangerous information first, then the number of reports */
const URGENT_REASONS = new Set(['copyright', 'dangerous']);
const URGENT_PRIORITY = 1000;
const REPORT_WEIGHT = 4;
const UNRELIABLE_WEIGHT = 1;

export const reportSchema = z
	.object({
		targetType: z.enum(['image', 'recipe', 'cookbook', 'user']),
		targetId: z.string().min(1).max(100),
		reason: z.enum(REPORT_REASONS),
		comment: z.string().trim().max(2000).optional().default(''),
		originalUrl: z.string().trim().max(500).optional().default(''),
		isRightsHolder: z.boolean().optional(),
		email: z.string().trim().max(200).optional().default('')
	})
	.superRefine((report, ctx) => {
		const option = REPORT_REASON_OPTIONS.find(({ id }) => id === report.reason)!;
		if (option.needsComment && !report.comment) {
			ctx.addIssue({ code: 'custom', message: 'Bitte beschreibe kurz, worum es geht.' });
		}
		if (report.reason === 'copyright') {
			if (!z.url().safeParse(report.originalUrl).success) {
				ctx.addIssue({ code: 'custom', message: 'Bitte gib den Link zum Original an.' });
			}
			if (report.isRightsHolder === undefined) {
				ctx.addIssue({
					code: 'custom',
					message: 'Bitte gib an, ob du die Rechte besitzt oder in wessen Auftrag du handelst.'
				});
			}
		}
		if (report.email && !z.email().safeParse(report.email).success) {
			ctx.addIssue({ code: 'custom', message: 'Bitte gib eine gültige E-Mail-Adresse an.' });
		}
	});

export type ReportInput = z.infer<typeof reportSchema>;

/** Recomputes the priority from the reasons and the number of different reporters */
export const updatePriority = async (db: Database, caseId: number) => {
	const rows = await db
		.select({
			reason: reports.reason,
			reporter: sql<string>`coalesce(${reports.reporterUserId}, ${reports.reporterIpHash})`,
			unreliable: users.unreliableReporter
		})
		.from(reports)
		.leftJoin(users, eq(users.id, reports.reporterUserId))
		.where(eq(reports.caseId, caseId));
	// the same person counts once, however often they report
	const weights = new Map(
		rows.map(({ reporter, unreliable }) => [
			reporter,
			unreliable ? UNRELIABLE_WEIGHT : REPORT_WEIGHT
		])
	);
	const priority =
		(rows.some(({ reason }) => URGENT_REASONS.has(reason)) ? URGENT_PRIORITY : 0) +
		[...weights.values()].reduce((sum, weight) => sum + weight, 0);
	await db.update(reportCases).set({ priority }).where(eq(reportCases.id, caseId));
};

/**
 * Adds a report to the open case of the object or opens a new one with a snapshot of the object.
 * Reports never hide anything by themselves, they only raise the priority.
 */
export const createReport = async (
	db: Database,
	input: ReportInput,
	reporter: { userId: string | null; email: string | null; ipHash: string }
) => {
	const target = await loadTarget(db, input.targetType as ReportTarget, input.targetId);
	if (!target) return { error: 'Diesen Inhalt gibt es nicht mehr.' } as const;

	let [openCase] = await db
		.select()
		.from(reportCases)
		.where(
			and(
				eq(reportCases.targetType, input.targetType),
				eq(reportCases.targetId, input.targetId),
				inArray(reportCases.status, ['open', 'in_review'])
			)
		)
		.limit(1);
	if (!openCase) {
		[openCase] = await db
			.insert(reportCases)
			.values({ targetType: input.targetType, targetId: input.targetId, snapshot: target })
			.returning();
	}

	const duplicate = await db.query.reports.findFirst({
		where: and(
			eq(reports.caseId, openCase.id),
			eq(reports.reason, input.reason),
			reporter.userId
				? eq(reports.reporterUserId, reporter.userId)
				: eq(reports.reporterIpHash, reporter.ipHash)
		)
	});
	if (!duplicate) {
		await db.insert(reports).values({
			caseId: openCase.id,
			targetType: input.targetType,
			targetId: input.targetId,
			reason: input.reason,
			comment: input.comment || null,
			originalUrl: input.originalUrl || null,
			isRightsHolder: input.isRightsHolder ?? null,
			reporterUserId: reporter.userId,
			reporterEmail: reporter.email,
			reporterIpHash: reporter.ipHash
		});
		await updatePriority(db, openCase.id);
	}
	return { caseId: openCase.id, duplicate: Boolean(duplicate) } as const;
};

const adminAddresses = async (db: Database) =>
	(await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'))).map(
		({ email }) => email
	);

/** Copyright reports are urgent, the admins hear about them right away */
export const notifyAdminsNow = async (db: Database, origin: string, caseId: number) => {
	for (const email of await adminAddresses(db)) {
		await sendMail(
			db,
			email,
			renderMail({
				subject: 'Neue Meldung wegen Urheberrecht',
				paragraphs: ['Es gibt eine neue Meldung wegen einer Urheberrechtsverletzung.'],
				button: { label: 'Meldung ansehen', url: `${origin}/admin/meldungen/${caseId}` }
			}),
			{ kind: 'admin-report', retry: true }
		);
	}
};

/** At most one mail a day about the reports of the last day */
export const sendDailyReportSummary = async (db: Database, origin: string, now = new Date()) => {
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(reports)
		.where(
			sql`${reports.createdAt} > ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}`
		);
	if (!count) return 0;
	for (const email of await adminAddresses(db)) {
		await sendMail(
			db,
			email,
			renderMail({
				subject: `${count} neue Meldung${count === 1 ? '' : 'en'}`,
				paragraphs: [`In den letzten 24 Stunden kamen ${count} neue Meldungen.`],
				button: { label: 'Meldungen ansehen', url: `${origin}/admin/meldungen` }
			}),
			{ kind: 'admin-summary', retry: true }
		);
	}
	return count;
};

/** Cases about objects that were deleted meanwhile are closed */
export const closeCasesOfDeletedTargets = async (db: Database) => {
	const open = await db
		.select({ id: reportCases.id, type: reportCases.targetType, targetId: reportCases.targetId })
		.from(reportCases)
		.where(inArray(reportCases.status, ['open', 'in_review']));
	let closed = 0;
	for (const item of open) {
		if (await loadTarget(db, item.type, item.targetId)) continue;
		await db
			.update(reportCases)
			.set({
				status: 'done',
				decision: 'gone',
				decisionReason: 'Inhalt nicht mehr vorhanden',
				decidedAt: new Date()
			})
			.where(eq(reportCases.id, item.id));
		closed++;
	}
	return closed;
};
