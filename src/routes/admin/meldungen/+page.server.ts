import { asc, desc, inArray, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { reportCases, reports } from '#lib/server/db/schema.js';

export async function load({ url }) {
	const showClosed = url.searchParams.has('erledigt');
	const db = getDb();
	const cases = await db
		.select({
			id: reportCases.id,
			targetType: reportCases.targetType,
			status: reportCases.status,
			priority: reportCases.priority,
			snapshot: reportCases.snapshot,
			appealOf: reportCases.appealOf,
			decision: reportCases.decision,
			createdAt: reportCases.createdAt,
			reports: sql<number>`(select count(*)::int from ${reports} where ${reports.caseId} = ${reportCases.id})`,
			reasons: sql<
				string[]
			>`(select array_agg(distinct ${reports.reason}) from ${reports} where ${reports.caseId} = ${reportCases.id})`
		})
		.from(reportCases)
		.where(inArray(reportCases.status, showClosed ? ['done', 'rejected'] : ['open', 'in_review']))
		.orderBy(
			...(showClosed
				? [desc(reportCases.decidedAt)]
				: [desc(reportCases.priority), asc(reportCases.createdAt)])
		)
		.limit(200);
	return {
		showClosed,
		cases: cases.map(({ snapshot, ...rest }) => ({
			...rest,
			title: (snapshot as { title?: string } | null)?.title ?? ''
		}))
	};
}
