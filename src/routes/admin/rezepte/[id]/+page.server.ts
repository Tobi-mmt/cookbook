import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireAdmin } from '#lib/server/auth/guards.js';
import { getDb, getStorage } from '#lib/server/context.js';
import { cookbooks, recipes, users } from '#lib/server/db/schema.js';
import { audit } from '#lib/server/moderation/audit.js';
import { removeImage, setHidden } from '#lib/server/moderation/decisions.js';
import { moveRecipe } from '#lib/server/recipeTransfer.js';
import { revalidate } from '#lib/server/revalidate.js';
import { moveRecipeToTrash, restoreRecipe } from '#lib/server/trash.js';
import { slugerize } from '#lib/slugerize.js';

const loadRecipe = async (id: string) => {
	const recipe = await getDb().query.recipes.findFirst({ where: eq(recipes.id, id) });
	if (!recipe) error(404, 'Dieses Rezept gibt es nicht');
	return recipe;
};

export async function load(event) {
	await requireAdmin(event);
	const recipe = await loadRecipe(event.params.id);
	const cookbook = await getDb().query.cookbooks.findFirst({
		where: eq(cookbooks.id, recipe.cookbookId)
	});
	return {
		recipe: {
			id: recipe.id,
			title: recipe.title,
			slug: slugerize(recipe.title),
			hasImage: Boolean(recipe.image),
			hiddenReason: recipe.hiddenAt ? recipe.hiddenReason : null,
			deleted: Boolean(recipe.deletedAt)
		},
		cookbook: cookbook && { id: cookbook.id, name: cookbook.name }
	};
}

const change = async (
	event: RequestEvent<{ id: string }>,
	action: string,
	run: (form: FormData, adminId: string) => Promise<string | { error: string }>
) => {
	const admin = await requireAdmin(event);
	const db = getDb();
	const before = await loadRecipe(event.params.id);
	const result = await run(await event.request.formData(), admin.id);
	if (typeof result === 'object') return fail(400, result);
	const after = await loadRecipe(event.params.id);
	await audit(db, {
		adminId: admin.id,
		action,
		targetType: 'recipe',
		targetId: before.id,
		before: {
			cookbookId: before.cookbookId,
			hiddenReason: before.hiddenReason,
			deletedAt: before.deletedAt,
			image: Boolean(before.image)
		},
		after: {
			cookbookId: after.cookbookId,
			hiddenReason: after.hiddenReason,
			deletedAt: after.deletedAt,
			image: Boolean(after.image)
		}
	});
	await revalidate(
		event.url.origin,
		await affectedPaths(db, {
			cookbookIds: [before.cookbookId, after.cookbookId],
			recipes: [before]
		})
	);
	return { saved: result };
};

const context = (event: RequestEvent, adminId: string) => ({
	db: getDb(),
	storage: getStorage(),
	origin: event.url.origin,
	adminId
});

export const actions = {
	removeImage: (event) =>
		change(event, 'recipe:remove-image', async (_form, adminId) => {
			await removeImage(context(event, adminId), [event.params.id]);
			return 'Bild entfernt.';
		}),
	move: (event) =>
		change(event, 'recipe:move', async (form) => {
			const [owner, slug] = String(form.get('target') ?? '')
				.trim()
				.replace(/^@/, '')
				.split('/');
			const [target] = await getDb()
				.select({ id: cookbooks.id })
				.from(cookbooks)
				.innerJoin(users, eq(users.id, cookbooks.ownerId))
				.where(and(eq(users.username, owner?.toLowerCase() ?? ''), eq(cookbooks.slug, slug ?? '')));
			if (!target) return { error: 'Dieses Kochbuch gibt es nicht. Format: @person/kochbuch' };
			await moveRecipe(getDb(), event.params.id, target.id);
			return 'Verschoben.';
		}),
	hide: (event) =>
		change(event, 'recipe:hide', async (form, adminId) => {
			const reason = String(form.get('reason') ?? '').trim();
			if (!reason) return { error: 'Bitte gib einen Grund an.' };
			await setHidden(context(event, adminId), 'recipe', event.params.id, reason);
			return 'Ausgeblendet.';
		}),
	unhide: (event) =>
		change(event, 'recipe:unhide', async (_form, adminId) => {
			await setHidden(context(event, adminId), 'recipe', event.params.id, null);
			return 'Wieder sichtbar.';
		}),
	delete: (event) =>
		change(event, 'recipe:delete', async (_form, adminId) => {
			await moveRecipeToTrash(getDb(), event.params.id, adminId);
			return 'In den Papierkorb gelegt.';
		}),
	restore: (event) =>
		change(event, 'recipe:restore', async () => {
			await restoreRecipe(getDb(), event.params.id);
			return 'Wiederhergestellt.';
		})
};
