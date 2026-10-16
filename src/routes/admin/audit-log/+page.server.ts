import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { adminAuditLog, users } from '#lib/server/db/schema.js';
import { PAGE_SIZE, pageOffset, pagination, readPage } from '#lib/server/pagination.js';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function load({ url }) {
	const admin = url.searchParams.get('admin') ?? '';
	const target = url.searchParams.get('objekt') ?? '';
	const from = url.searchParams.get('von') ?? '';
	const to = url.searchParams.get('bis') ?? '';
	const page = readPage(url);
	const where = and(
		admin ? eq(adminAuditLog.adminId, admin) : undefined,
		target ? eq(adminAuditLog.targetType, target) : undefined,
		DAY_PATTERN.test(from) ? gte(adminAuditLog.createdAt, new Date(`${from}T00:00:00`)) : undefined,
		DAY_PATTERN.test(to) ? lte(adminAuditLog.createdAt, new Date(`${to}T23:59:59`)) : undefined
	);
	const db = getDb();
	const [entries, admins, [{ total }]] = await Promise.all([
		db
			.select({
				id: adminAuditLog.id,
				admin: users.name,
				action: adminAuditLog.action,
				targetType: adminAuditLog.targetType,
				targetId: adminAuditLog.targetId,
				before: adminAuditLog.before,
				after: adminAuditLog.after,
				note: adminAuditLog.note,
				createdAt: adminAuditLog.createdAt
			})
			.from(adminAuditLog)
			.leftJoin(users, eq(users.id, adminAuditLog.adminId))
			.where(where)
			.orderBy(desc(adminAuditLog.createdAt))
			.limit(PAGE_SIZE)
			.offset(pageOffset(page)),
		db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, 'admin')),
		db.select({ total: count() }).from(adminAuditLog).where(where)
	]);
	return {
		entries,
		admins,
		filter: { admin, target, from, to },
		pagination: pagination(page, entries.length, total)
	};
}
