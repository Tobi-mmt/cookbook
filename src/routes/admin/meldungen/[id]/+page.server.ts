import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { and, desc, eq, ne } from 'drizzle-orm';
import { requireAdmin } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import { appeals, reportCases, reports, users } from '#lib/server/db/schema.js';
import { renderMail, sendMail } from '#lib/server/mail.js';
import { audit } from '#lib/server/moderation/audit.js';
import {
	DECISIONS,
	decideCase,
	findImageCopies,
	revertDecision,
	type Decision
} from '#lib/server/moderation/decisions.js';
import { affectedUsers, loadTarget } from '#lib/server/moderation/targets.js';
import { listVersions } from '#lib/server/versions.js';

const loadCase = async (id: number) => {
	const found = await getDb().query.reportCases.findFirst({ where: eq(reportCases.id, id) });
	if (!found) error(404, 'Fall nicht gefunden');
	return found;
};

/** An admin does not decide about own content as long as there is another admin */
const selfCheck = async (caseId: number, adminId: string) => {
	const db = getDb();
	const found = await loadCase(caseId);
	const involved = (await affectedUsers(db, found.targetType, found.targetId)).some(
		({ id }) => id === adminId
	);
	const otherAdmins = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.role, 'admin'), ne(users.id, adminId)));
	return { involved, blocked: involved && otherAdmins.length > 0 };
};

export async function load(event) {
	const admin = await requireAdmin(event);
	const db = getDb();
	const id = Number(event.params.id);
	const found = await loadCase(id);
	const { targetType: type, targetId } = found;

	const [caseReports, current, affected, history, previous, copies, original, appeal, self] =
		await Promise.all([
			db
				.select({
					id: reports.id,
					reason: reports.reason,
					comment: reports.comment,
					originalUrl: reports.originalUrl,
					isRightsHolder: reports.isRightsHolder,
					email: reports.reporterEmail,
					createdAt: reports.createdAt,
					reporterId: users.id,
					reporterName: users.name,
					reporterUsername: users.username,
					unreliable: users.unreliableReporter
				})
				.from(reports)
				.leftJoin(users, eq(users.id, reports.reporterUserId))
				.where(eq(reports.caseId, found.appealOf ?? id)),
			loadTarget(db, type, targetId),
			affectedUsers(db, type, targetId),
			type === 'recipe' || type === 'image' ? listVersions(db, targetId) : [],
			db
				.select()
				.from(reportCases)
				.where(
					and(
						eq(reportCases.targetType, type),
						eq(reportCases.targetId, targetId),
						ne(reportCases.id, id)
					)
				)
				.orderBy(desc(reportCases.createdAt)),
			type === 'image' ? findImageCopies(db, targetId) : [],
			found.appealOf ? loadCase(found.appealOf) : null,
			found.appealOf
				? db.query.appeals.findFirst({ where: eq(appeals.caseId, found.appealOf) })
				: null,
			selfCheck(id, admin.id)
		]);

	return {
		case: found,
		reports: caseReports,
		current,
		affected: affected.map(({ id: userId, name }) => ({ id: userId, name })),
		history,
		previous,
		copies,
		original,
		appeal,
		self,
		decisions: DECISIONS
	};
}

const decisionNote = (involved: boolean) =>
	involved ? 'Der einzige Admin entscheidet über eigene Inhalte' : undefined;

export const actions = {
	review: async (event) => {
		const admin = await requireAdmin(event);
		const id = Number(event.params.id);
		await getDb()
			.update(reportCases)
			.set({ status: 'in_review', assignedTo: admin.id })
			.where(eq(reportCases.id, id));
		return { saved: 'Du prüfst diesen Fall.' };
	},

	decide: async (event) => {
		const admin = await requireAdmin(event);
		const id = Number(event.params.id);
		const self = await selfCheck(id, admin.id);
		if (self.blocked)
			return fail(403, { error: 'Dieser Fall betrifft dich, ein anderer Admin entscheidet.' });

		const form = await event.request.formData();
		const decision = String(form.get('decision')) as Decision;
		const reason = String(form.get('reason') ?? '').trim();
		if (!(decision in DECISIONS)) return fail(400, { error: 'Bitte wähle eine Maßnahme.' });
		if (!reason) return fail(400, { error: 'Jede Entscheidung braucht eine Begründung.' });

		await decideCase(
			{ db: getDb(), storage: getStorage(), origin: event.url.origin, adminId: admin.id },
			id,
			{
				decision,
				reason,
				newName: String(form.get('newName') ?? '').trim() || undefined,
				includeCopies: form.get('includeCopies') === 'on',
				note: decisionNote(self.involved)
			}
		);
		return { saved: 'Entschieden.' };
	},

	/** The appeal succeeds: the original decision is reversed */
	revert: async (event) => answerAppeal(event, true),
	/** The appeal fails: the decision stays */
	uphold: async (event) => answerAppeal(event, false),

	unreliable: async (event) => {
		const admin = await requireAdmin(event);
		const userId = String((await event.request.formData()).get('userId'));
		const db = getDb();
		await db.update(users).set({ unreliableReporter: true }).where(eq(users.id, userId));
		await audit(db, {
			adminId: admin.id,
			action: 'user:unreliable',
			targetType: 'user',
			targetId: userId
		});
		return { saved: 'Meldungen dieser Person zählen künftig weniger.' };
	}
};

const answerAppeal = async (event: RequestEvent<{ id: string }>, success: boolean) => {
	const admin = await requireAdmin(event);
	const db = getDb();
	const appealCase = await loadCase(Number(event.params.id));
	if (!appealCase.appealOf) return fail(400, { error: 'Das ist kein Widerspruch.' });
	const self = await selfCheck(appealCase.id, admin.id);
	if (self.blocked)
		return fail(403, { error: 'Dieser Fall betrifft dich, ein anderer Admin entscheidet.' });

	const reason = String((await event.request.formData()).get('reason') ?? '').trim();
	if (!reason) return fail(400, { error: 'Bitte begründe die Entscheidung.' });

	const context = { db, storage: getStorage(), origin: event.url.origin, adminId: admin.id };
	if (success) await revertDecision(context, appealCase.appealOf);

	const appeal = await db.query.appeals.findFirst({
		where: eq(appeals.caseId, appealCase.appealOf)
	});
	if (appeal) {
		await db
			.update(appeals)
			.set({ status: success ? 'reverted' : 'upheld' })
			.where(eq(appeals.id, appeal.id));
	}
	await db
		.update(reportCases)
		.set({
			status: 'done',
			decision: success ? 'appeal_reverted' : 'appeal_upheld',
			decisionReason: reason,
			decidedBy: admin.id,
			decidedAt: new Date()
		})
		.where(eq(reportCases.id, appealCase.id));
	await audit(db, {
		adminId: admin.id,
		action: success ? 'appeal:reverted' : 'appeal:upheld',
		targetType: appealCase.targetType,
		targetId: appealCase.targetId,
		after: { caseId: appealCase.id, reason },
		note: decisionNote(self.involved)
	});

	const appellant = appeal?.userId
		? await db.query.users.findFirst({ where: eq(users.id, appeal.userId) })
		: undefined;
	if (appellant) {
		await sendMail(
			db,
			appellant.email,
			renderMail({
				subject: 'Entscheidung über deinen Widerspruch',
				paragraphs: [
					`Hallo ${appellant.name},`,
					success
						? 'wir haben deinen Widerspruch geprüft und die Maßnahme aufgehoben.'
						: 'wir haben deinen Widerspruch geprüft und bleiben bei unserer Entscheidung.',
					`Begründung: ${reason}`
				]
			}),
			{ kind: 'appeal-result', retry: true }
		);
	}
	return { saved: 'Über den Widerspruch ist entschieden.' };
};
