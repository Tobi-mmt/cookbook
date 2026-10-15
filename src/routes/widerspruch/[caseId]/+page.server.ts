import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { reportCases } from '#lib/server/db/schema.js';
import { createAppeal, DECISIONS, type Decision } from '#lib/server/moderation/decisions.js';
import { affectedUsers } from '#lib/server/moderation/targets.js';

const loadOwnCase = async (event: RequestEvent<{ caseId: string }>) => {
	const user = await requireUser(event);
	const db = getDb();
	const found = await db.query.reportCases.findFirst({
		where: eq(reportCases.id, Number(event.params.caseId))
	});
	if (!found) error(404, 'Diese Entscheidung gibt es nicht');
	const affected = await affectedUsers(db, found.targetType, found.targetId);
	if (!affected.some(({ id }) => id === user.id))
		error(403, 'Diese Entscheidung betrifft dich nicht');
	return { user, found };
};

export async function load(event) {
	const { found } = await loadOwnCase(event);
	return {
		title: (found.snapshot as { title?: string } | null)?.title ?? '',
		decision: DECISIONS[found.decision as Decision] ?? found.decision,
		reason: found.decisionReason
	};
}

export const actions = {
	default: async (event) => {
		const { user, found } = await loadOwnCase(event);
		const reason = String((await event.request.formData()).get('reason') ?? '').trim();
		if (!reason) return fail(400, { error: 'Bitte begründe deinen Widerspruch.' });
		const result = await createAppeal(getDb(), { caseId: found.id, userId: user.id, reason });
		if ('error' in result) return fail(400, { error: result.error });
		return { sent: true };
	}
};
