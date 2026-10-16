import { asc, count, desc, inArray, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { reportCases, reports } from '#lib/server/db/schema.js';
import { PAGE_SIZE, pageOffset, pagination, readPage } from '#lib/server/pagination.js';

export async function load({ url }) {
	const showClosed = url.searchParams.has('erledigt');
	const page = readPage(url);
	const where = inArray(
		reportCases.status,
		showClosed ? ['done', 'rejected'] : ['open', 'in_review']
	);
	const db = getDb();
	const [cases, [{ total }]] = await Promise.all([
		db
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
			.where(where)
			.orderBy(
				...(showClosed
					? [desc(reportCases.decidedAt)]
					: [desc(reportCases.priority), asc(reportCases.createdAt)])
			)
			.limit(PAGE_SIZE)
			.offset(pageOffset(page)),
		db.select({ total: count() }).from(reportCases).where(where)
	]);
	return {
		showClosed,
		pagination: pagination(page, cases.length, total),
		cases: cases.map(({ snapshot, ...rest }) => ({
			...rest,
			title: (snapshot as { title?: string } | null)?.title ?? ''
		}))
	};
}
