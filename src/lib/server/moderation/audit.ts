import type { Database } from '../db/client';
import { adminAuditLog } from '../db/schema';

export const audit = (
	db: Database,
	entry: {
		adminId: string;
		action: string;
		targetType: string;
		targetId: string;
		before?: unknown;
		after?: unknown;
		note?: string;
	}
) =>
	db.insert(adminAuditLog).values({
		...entry,
		before: entry.before ?? null,
		after: entry.after ?? null,
		note: entry.note ?? null
	});
