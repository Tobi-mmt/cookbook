import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { adminAuditLog, users } from '#lib/server/db/schema.js';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function load({ url }) {
	const admin = url.searchParams.get('admin') ?? '';
	const target = url.searchParams.get('objekt') ?? '';
	const from = url.searchParams.get('von') ?? '';
	const to = url.searchParams.get('bis') ?? '';
	const db = getDb();
	const [entries, admins] = await Promise.all([
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
			.where(
				and(
					admin ? eq(adminAuditLog.adminId, admin) : undefined,
					target ? eq(adminAuditLog.targetType, target) : undefined,
					DAY_PATTERN.test(from)
						? gte(adminAuditLog.createdAt, new Date(`${from}T00:00:00`))
						: undefined,
					DAY_PATTERN.test(to)
						? lte(adminAuditLog.createdAt, new Date(`${to}T23:59:59`))
						: undefined
				)
			)
			.orderBy(desc(adminAuditLog.createdAt))
			.limit(200),
		db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, 'admin'))
	]);
	return { entries, admins, filter: { admin, target, from, to } };
}
