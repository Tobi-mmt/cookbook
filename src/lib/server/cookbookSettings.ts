import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { affectedPaths } from './affectedPaths';
import { requireEditor, requireOwner } from './auth/guards';
import { getDb } from './context';
import {
	countOwnedCookbooks,
	ensureCookbook,
	listMembers,
	removeEditor,
	renameCookbook,
	transferCookbook
} from './cookbooks';
import { cookbooks, recipes, users } from './db/schema';
import { inviteToCookbook, listOpenInvitations, revokeInvitation } from './invitations';
import { revalidate } from './revalidate';
import { listTrash, moveAllRecipesToTrash, restoreRecipe } from './trash';
import { addDays, cookbookStats } from './recipeViews';
import { trackingDay } from './tracking';

/** The cookbook of the settings page, also when it is hidden by the moderation */
export const findEditableCookbook = async (event: RequestEvent) => {
	const { handle, cookbook: slug } = event.params as { handle: string; cookbook: string };
	const db = getDb();
	const [row] = await db
		.select({ cookbook: cookbooks })
		.from(cookbooks)
		.innerJoin(users, eq(users.id, cookbooks.ownerId))
		.where(
			and(
				eq(users.username, handle.slice(1).toLowerCase()),
				eq(cookbooks.slug, slug),
				isNull(cookbooks.deletedAt)
			)
		);
	if (!row) error(404, 'Dieses Kochbuch gibt es nicht');
	return row.cookbook;
};

export const loadCookbookSettings = async (event: RequestEvent) => {
	const cookbook = await findEditableCookbook(event);
	const editor = await requireEditor(event, cookbook.id);
	const db = getDb();
	const from = addDays(trackingDay(), -29);
	const [members, invitations, ownedCount, trash, stats] = await Promise.all([
		listMembers(db, cookbook.id),
		listOpenInvitations(db, cookbook.id),
		countOwnedCookbooks(db, cookbook.ownerId),
		listTrash(db, cookbook.id),
		cookbookStats(db, cookbook.id, from)
	]);
	return {
		cookbook: {
			id: cookbook.id,
			name: cookbook.name,
			slug: cookbook.slug,
			hiddenReason: cookbook.hiddenAt ? cookbook.hiddenReason : null
		},
		members,
		invitations,
		me: { id: editor.id, isOwner: editor.cookbookRole === 'owner' },
		isLastCookbook: ownedCount <= 1,
		trash,
		stats: {
			...stats,
			days: Array.from({ length: 30 }, (_, index) => {
				const day = addDays(from, index);
				return { day, visitors: stats.perDay.find((row) => row.day === day)?.visitors ?? 0 };
			})
		}
	};
};

const refresh = async (event: RequestEvent, cookbookId: string, extraPaths: string[] = []) =>
	revalidate(event.url.origin, [
		...(await affectedPaths(getDb(), { cookbookIds: [cookbookId] })),
		...extraPaths
	]);

const nameSchema = z
	.string()
	.trim()
	.min(1, 'Bitte gib einen Namen an.')
	.max(80, 'Höchstens 80 Zeichen');

export const cookbookSettingsActions = {
	rename: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		const owner = await requireOwner(event, cookbook.id);
		const parsed = nameSchema.safeParse((await event.request.formData()).get('name'));
		if (!parsed.success) return fail(400, { error: parsed.error.issues[0].message });

		const { old, slug } = await renameCookbook(getDb(), cookbook.id, parsed.data);
		await refresh(event, cookbook.id, [`/@${owner.username}/${old.slug}`]);
		redirect(303, `/@${owner.username}/${slug}/einstellungen`);
	},

	invite: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		const editor = await requireEditor(event, cookbook.id);
		const email = String((await event.request.formData()).get('email') ?? '').trim();
		if (email && !z.email().safeParse(email).success) {
			return fail(400, { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}

		const link = await inviteToCookbook(getDb(), {
			origin: event.url.origin,
			cookbook,
			inviter: editor,
			email
		});
		return { link, sentTo: email || null };
	},

	revoke: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		await requireEditor(event, cookbook.id);
		await revokeInvitation(
			getDb(),
			cookbook.id,
			String((await event.request.formData()).get('id'))
		);
		return { revoked: true };
	},

	remove: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		await requireOwner(event, cookbook.id);
		const userId = String((await event.request.formData()).get('userId'));
		const db = getDb();
		const removed = await db.query.users.findFirst({ where: eq(users.id, userId) });
		await removeEditor(db, cookbook.id, userId);
		// everybody keeps at least one cookbook
		await ensureCookbook(db, userId);
		await refresh(event, cookbook.id, removed?.username ? [`/@${removed.username}`] : []);
		return { removed: true };
	},

	leave: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		const editor = await requireEditor(event, cookbook.id);
		if (editor.cookbookRole === 'owner') {
			return fail(400, { error: 'Übergib das Kochbuch zuerst an eine andere Person.' });
		}
		await removeEditor(getDb(), cookbook.id, editor.id);
		await ensureCookbook(getDb(), editor.id);
		await refresh(event, cookbook.id, [`/@${editor.username}`]);
		redirect(303, `/@${editor.username}`);
	},

	transfer: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		await requireOwner(event, cookbook.id);
		const userId = String((await event.request.formData()).get('userId'));
		const db = getDb();
		const members = await listMembers(db, cookbook.id);
		const target = members.find((member) => member.userId === userId && member.role === 'editor');
		if (!target) return fail(400, { error: 'Diese Person bearbeitet das Kochbuch nicht.' });

		const { old, slug } = await transferCookbook(db, cookbook.id, userId);
		const oldOwner = members.find((member) => member.userId === old.ownerId);
		await refresh(event, cookbook.id, oldOwner ? [`/@${oldOwner.username}/${old.slug}`] : []);
		redirect(303, `/@${target.username}/${slug}/einstellungen`);
	},

	restore: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		await requireEditor(event, cookbook.id);
		const id = String((await event.request.formData()).get('id'));
		const db = getDb();
		const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
		if (!recipe || recipe.cookbookId !== cookbook.id)
			return fail(404, { error: 'Rezept nicht gefunden.' });
		await restoreRecipe(db, id);
		await revalidate(
			event.url.origin,
			await affectedPaths(db, { cookbookIds: [cookbook.id], recipes: [recipe] })
		);
		return { restored: recipe.title };
	},

	deleteRecipes: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		const owner = await requireOwner(event, cookbook.id);
		await moveAllRecipesToTrash(getDb(), cookbook.id, owner.id);
		await refresh(event, cookbook.id);
		return { emptied: true };
	},

	delete: async (event: RequestEvent) => {
		const cookbook = await findEditableCookbook(event);
		const owner = await requireOwner(event, cookbook.id);
		const db = getDb();
		if ((await countOwnedCookbooks(db, cookbook.ownerId)) <= 1) {
			return fail(400, { error: 'Dein letztes Kochbuch kannst du nicht löschen.' });
		}
		const paths = await affectedPaths(db, { cookbookIds: [cookbook.id] });
		await db.update(cookbooks).set({ deletedAt: new Date() }).where(eq(cookbooks.id, cookbook.id));
		await revalidate(event.url.origin, paths);
		redirect(303, `/@${owner.username}`);
	}
};
