import { and, asc, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm';
import type { ReportTarget } from '../../reportReasons';
import { affectedPaths } from '../affectedPaths';
import { signOutEverywhere } from '../accounts';
import { renameCookbook, transferCookbook } from '../cookbooks';
import type { Database } from '../db/client';
import {
	appeals,
	cookbookEditors,
	cookbooks,
	recipes,
	recipeVersions,
	reportCases,
	reports,
	users
} from '../db/schema';
import { imageUrls } from '../images';
import { renderMail, sendMail } from '../mail';
import { revalidate } from '../revalidate';
import type { Storage } from '../storage';
import { moveRecipeToTrash } from '../trash';
import { changeUsername } from '../users';
import { audit } from './audit';
import { affectedUsers } from './targets';

export const BAN_REASON_PREFIX = 'Konto gesperrt';

export const DECISIONS = {
	remove_image: 'Bild entfernt',
	hide: 'Ausgeblendet',
	delete: 'Gelöscht',
	rename: 'Kochbuch umbenannt',
	reset_username: 'Benutzername zurückgesetzt',
	warn: 'Verwarnt',
	ban: 'Gesperrt',
	reject: 'Kein Verstoß'
} as const;
export type Decision = keyof typeof DECISIONS;

type Context = { db: Database; storage: Storage; origin: string; adminId: string };

const cookbookOf = async (db: Database, type: ReportTarget, id: string) =>
	type === 'cookbook'
		? id
		: (
				await db.query.recipes.findFirst({
					where: eq(recipes.id, id),
					columns: { cookbookId: true }
				})
			)?.cookbookId;

const refresh = async (
	{ db, origin }: Context,
	cookbookIds: string[],
	recipeIds: string[] = []
) => {
	const recipeRows = recipeIds.length
		? await db
				.select({ id: recipes.id, title: recipes.title })
				.from(recipes)
				.where(inArray(recipes.id, recipeIds))
		: [];
	await revalidate(origin, await affectedPaths(db, { cookbookIds, recipes: recipeRows }));
};

/** All recipes that show the same image, also copies (they share the placeholder) */
export const findImageCopies = async (db: Database, recipeId: string) => {
	const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, recipeId) });
	if (!recipe?.image) return [];
	return db
		.select({ id: recipes.id, title: recipes.title, cookbookId: recipes.cookbookId })
		.from(recipes)
		.where(sql`${recipes.image}->>'placeholder' = ${recipe.image.placeholder}`);
};

/** Removes the image from the recipes and from all their versions and deletes its files */
const removeImage = async (context: Context, recipeIds: string[]) => {
	const { db, storage } = context;
	const rows = await db.select().from(recipes).where(inArray(recipes.id, recipeIds));
	for (const row of rows) {
		if (!row.image) continue;
		const placeholder = row.image.placeholder;
		const versions = await db
			.select()
			.from(recipeVersions)
			.where(
				and(
					eq(recipeVersions.recipeId, row.id),
					sql`${recipeVersions.snapshot}->'image'->>'placeholder' = ${placeholder}`
				)
			);
		await storage.deleteFiles([
			...imageUrls(row.image),
			...versions.flatMap(({ snapshot }) => imageUrls(snapshot.image))
		]);
		if (versions.length) {
			await db
				.update(recipeVersions)
				.set({ snapshot: sql`jsonb_set(${recipeVersions.snapshot}, '{image}', 'null')` })
				.where(
					inArray(
						recipeVersions.id,
						versions.map(({ id }) => id)
					)
				);
		}
		await db.update(recipes).set({ image: null }).where(eq(recipes.id, row.id));
	}
	await refresh(context, [...new Set(rows.map(({ cookbookId }) => cookbookId))], recipeIds);
};

const setHidden = async (
	context: Context,
	type: ReportTarget,
	id: string,
	reason: string | null
) => {
	const { db } = context;
	const hiddenAt = reason ? new Date() : null;
	if (type === 'cookbook') {
		await db.update(cookbooks).set({ hiddenAt, hiddenReason: reason }).where(eq(cookbooks.id, id));
	} else {
		await db.update(recipes).set({ hiddenAt, hiddenReason: reason }).where(eq(recipes.id, id));
	}
	const cookbookId = await cookbookOf(db, type, id);
	await refresh(context, cookbookId ? [cookbookId] : [], type === 'cookbook' ? [] : [id]);
};

/**
 * Bans a person: no more sign-in, the profile disappears, cookbooks without other editors are
 * hidden, shared ones get the editor who joined first as owner.
 */
export const banUser = async (context: Context, userId: string, reason: string) => {
	const { db } = context;
	await db.update(users).set({ banned: true, banReason: reason }).where(eq(users.id, userId));
	await signOutEverywhere(db, userId);

	const memberships = await db
		.select({ cookbookId: cookbookEditors.cookbookId, role: cookbookEditors.role })
		.from(cookbookEditors)
		.where(eq(cookbookEditors.userId, userId));
	for (const { cookbookId, role } of memberships) {
		const [successor] = await db
			.select({ userId: cookbookEditors.userId })
			.from(cookbookEditors)
			.innerJoin(users, eq(users.id, cookbookEditors.userId))
			.where(
				and(
					eq(cookbookEditors.cookbookId, cookbookId),
					ne(cookbookEditors.userId, userId),
					eq(users.banned, false)
				)
			)
			.orderBy(asc(cookbookEditors.joinedAt))
			.limit(1);
		if (!successor) {
			await db
				.update(cookbooks)
				.set({ hiddenAt: new Date(), hiddenReason: `${BAN_REASON_PREFIX}: ${reason}` })
				.where(eq(cookbooks.id, cookbookId));
		} else if (role === 'owner') {
			await transferCookbook(db, cookbookId, successor.userId);
		}
	}
	const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
	await refresh(
		context,
		memberships.map(({ cookbookId }) => cookbookId)
	);
	if (user?.username) await revalidate(context.origin, [`/@${user.username}`]);
};

export const unbanUser = async (context: Context, userId: string) => {
	const { db } = context;
	await db.update(users).set({ banned: false, banReason: null }).where(eq(users.id, userId));
	const hidden = await db
		.select({ id: cookbooks.id })
		.from(cookbooks)
		.innerJoin(cookbookEditors, eq(cookbookEditors.cookbookId, cookbooks.id))
		.where(
			and(
				eq(cookbookEditors.userId, userId),
				isNotNull(cookbooks.hiddenAt),
				sql`${cookbooks.hiddenReason} like ${BAN_REASON_PREFIX + '%'}`
			)
		);
	if (hidden.length) {
		await db
			.update(cookbooks)
			.set({ hiddenAt: null, hiddenReason: null })
			.where(
				inArray(
					cookbooks.id,
					hidden.map(({ id }) => id)
				)
			);
	}
	const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
	await refresh(
		context,
		hidden.map(({ id }) => id)
	);
	if (user?.username) await revalidate(context.origin, [`/@${user.username}`]);
};

/** A neutral name that keeps the person reachable until they choose a new one */
const resetUsername = async ({ db }: Context, userId: string) => {
	const username = `person-${userId
		.replace(/[^a-z0-9]/gi, '')
		.slice(0, 8)
		.toLowerCase()}`;
	await changeUsername(db, userId, username);
	return username;
};

const describe = (type: ReportTarget, snapshotTitle: string) =>
	({
		image: `das Bild von „${snapshotTitle}“`,
		recipe: `das Rezept „${snapshotTitle}“`,
		cookbook: `das Kochbuch „${snapshotTitle}“`,
		user: 'dein Konto'
	})[type];

/**
 * Applies a decision to the object of a case, closes the case and tells the affected editors
 * (with the way to appeal) and the reporters who left an address.
 */
export const decideCase = async (
	context: Context,
	caseId: number,
	{
		decision,
		reason,
		newName,
		includeCopies = false,
		note
	}: {
		decision: Decision;
		reason: string;
		newName?: string;
		includeCopies?: boolean;
		note?: string;
	}
) => {
	const { db, adminId, origin } = context;
	const found = await db.query.reportCases.findFirst({ where: eq(reportCases.id, caseId) });
	if (!found) throw new Error(`Case ${caseId} not found`);
	const { targetType: type, targetId: id } = found;
	const title = (found.snapshot as { title?: string } | null)?.title ?? '';
	const affected = await affectedUsers(db, type, id);

	switch (decision) {
		case 'remove_image':
			await removeImage(
				context,
				includeCopies ? (await findImageCopies(db, id)).map((copy) => copy.id) : [id]
			);
			break;
		case 'hide':
			await setHidden(context, type, id, reason);
			break;
		case 'delete':
			if (type === 'cookbook') {
				await db.update(cookbooks).set({ deletedAt: new Date() }).where(eq(cookbooks.id, id));
				await refresh(context, [id]);
			} else {
				await moveRecipeToTrash(db, id, adminId);
				const cookbookId = await cookbookOf(db, type, id);
				await refresh(context, cookbookId ? [cookbookId] : [], [id]);
			}
			break;
		case 'rename':
			if (type === 'cookbook' && newName) {
				await renameCookbook(db, id, newName);
				await refresh(context, [id]);
			}
			break;
		case 'reset_username':
			if (type === 'user') await resetUsername(context, id);
			break;
		case 'ban':
			if (type === 'user') await banUser(context, id, reason);
			break;
	}

	await db
		.update(reportCases)
		.set({
			status: decision === 'reject' ? 'rejected' : 'done',
			decision,
			decisionReason: reason,
			decidedBy: adminId,
			decidedAt: new Date()
		})
		.where(eq(reportCases.id, caseId));
	await audit(db, {
		adminId,
		action: `case:${decision}`,
		targetType: type,
		targetId: id,
		after: { caseId, reason, newName, includeCopies },
		note
	});

	if (decision !== 'reject') {
		for (const person of affected) {
			await sendMail(
				db,
				person.email,
				renderMail({
					subject: 'Eine Entscheidung der Moderation',
					paragraphs: [
						`Hallo ${person.name},`,
						`nach einer Meldung haben wir ${describe(type, title)} geprüft. Maßnahme: ${DECISIONS[decision]}.`,
						`Begründung: ${reason}`,
						decision === 'ban'
							? 'Wenn du nicht einverstanden bist, antworte auf diese Mail.'
							: 'Wenn du nicht einverstanden bist, kannst du einmal Widerspruch einlegen.'
					],
					...(decision === 'ban'
						? {}
						: { button: { label: 'Widerspruch einlegen', url: `${origin}/widerspruch/${caseId}` } })
				}),
				{ kind: 'moderation-decision', retry: true }
			);
		}
	}

	const reporters = await db
		.selectDistinct({ email: reports.reporterEmail })
		.from(reports)
		.where(and(eq(reports.caseId, caseId), isNotNull(reports.reporterEmail)));
	for (const { email } of reporters) {
		await sendMail(
			db,
			email!,
			renderMail({
				subject: 'Ergebnis deiner Meldung',
				paragraphs: [
					'Hallo,',
					decision === 'reject'
						? 'danke für deine Meldung. Wir haben den Inhalt geprüft und keinen Verstoß gegen unsere Regeln festgestellt.'
						: `danke für deine Meldung. Wir haben den Inhalt geprüft und gehandelt: ${DECISIONS[decision]}.`
				]
			}),
			{ kind: 'report-result', retry: true }
		);
	}
};

/** One appeal per decision and person, it becomes a new case, preferably for another admin */
export const createAppeal = async (
	db: Database,
	{ caseId, userId, reason }: { caseId: number; userId: string; reason: string }
) => {
	const original = await db.query.reportCases.findFirst({ where: eq(reportCases.id, caseId) });
	if (!original?.decision || original.decision === 'reject')
		return { error: 'Hier gibt es nichts zu widersprechen.' };
	const existing = await db.query.appeals.findFirst({
		where: and(eq(appeals.caseId, caseId), eq(appeals.userId, userId))
	});
	if (existing) return { error: 'Du hast schon Widerspruch eingelegt.' };

	await db.insert(appeals).values({ caseId, userId, reason });
	const [appealCase] = await db
		.insert(reportCases)
		.values({
			targetType: original.targetType,
			targetId: original.targetId,
			snapshot: original.snapshot,
			appealOf: caseId,
			priority: 2000
		})
		.returning();
	return { caseId: appealCase.id };
};

/** The editors fixed a hidden object and ask for another look */
export const requestReview = async (db: Database, type: ReportTarget, id: string) => {
	const [last] = await db
		.select()
		.from(reportCases)
		.where(
			and(
				eq(reportCases.targetType, type),
				eq(reportCases.targetId, id),
				eq(reportCases.decision, 'hide')
			)
		)
		.orderBy(sql`${reportCases.decidedAt} desc`)
		.limit(1);
	if (!last) return false;
	await db.update(reportCases).set({ status: 'open' }).where(eq(reportCases.id, last.id));
	return true;
};

/** Reverses a hide or delete, used when an appeal succeeds */
export const revertDecision = async (context: Context, caseId: number) => {
	const { db } = context;
	const found = await db.query.reportCases.findFirst({ where: eq(reportCases.id, caseId) });
	if (!found) return;
	const { targetType: type, targetId: id, decision } = found;
	if (decision === 'hide') await setHidden(context, type, id, null);
	if (decision === 'delete') {
		if (type === 'cookbook') {
			await db.update(cookbooks).set({ deletedAt: null }).where(eq(cookbooks.id, id));
		} else {
			await db.update(recipes).set({ deletedAt: null, deletedBy: null }).where(eq(recipes.id, id));
		}
		const cookbookId = await cookbookOf(db, type, id);
		await refresh(context, cookbookId ? [cookbookId] : [], type === 'cookbook' ? [] : [id]);
	}
	if (decision === 'ban') await unbanUser(context, id);
};
