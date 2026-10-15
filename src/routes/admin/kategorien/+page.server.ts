import { fail, type RequestEvent } from '@sveltejs/kit';
import { eq, inArray, sql } from 'drizzle-orm';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { requireAdmin } from '#lib/server/auth/guards.js';
import { listCategories } from '#lib/server/categories.js';
import { getDb } from '#lib/server/context.js';
import { categories, recipes } from '#lib/server/db/schema.js';
import { audit } from '#lib/server/moderation/audit.js';
import { revalidate } from '#lib/server/revalidate.js';
import { toSlug } from '#lib/username.js';

const COLOR = /^#[0-9a-fA-F]{6}$/;

export async function load() {
	const db = getDb();
	const [list, counts] = await Promise.all([
		listCategories(db),
		db
			.select({ id: recipes.categoryId, count: sql<number>`count(*)::int` })
			.from(recipes)
			.groupBy(recipes.categoryId)
	]);
	return {
		categories: list.map((category) => ({
			...category,
			recipes: counts.find(({ id }) => id === category.id)?.count ?? 0
		}))
	};
}

/** Category names and colors show on every page with a recipe of the category */
const revalidateCategory = async (event: RequestEvent, categoryIds: number[]) => {
	const db = getDb();
	const rows = await db
		.selectDistinct({ id: recipes.id, title: recipes.title, cookbookId: recipes.cookbookId })
		.from(recipes)
		.where(inArray(recipes.categoryId, categoryIds));
	await revalidate(
		event.url.origin,
		await affectedPaths(db, {
			cookbookIds: rows.map(({ cookbookId }) => cookbookId),
			recipes: rows
		})
	);
};

const readCategory = (form: FormData) => ({
	name: String(form.get('name') ?? '').trim(),
	color: String(form.get('color') ?? '').trim(),
	position: Number(form.get('position')) || 0
});

export const actions = {
	create: async (event) => {
		const admin = await requireAdmin(event);
		const values = readCategory(await event.request.formData());
		if (!values.name || !COLOR.test(values.color)) {
			return fail(400, { error: 'Name und Farbe (#rrggbb) sind nötig.' });
		}
		const [created] = await getDb()
			.insert(categories)
			.values({ ...values, slug: toSlug(values.name, 40) })
			.returning();
		await audit(getDb(), {
			adminId: admin.id,
			action: 'category:create',
			targetType: 'category',
			targetId: String(created.id),
			after: created
		});
		return { saved: 'Angelegt.' };
	},

	update: async (event) => {
		const admin = await requireAdmin(event);
		const form = await event.request.formData();
		const id = Number(form.get('id'));
		const values = readCategory(form);
		if (!values.name || !COLOR.test(values.color)) {
			return fail(400, { error: 'Name und Farbe (#rrggbb) sind nötig.' });
		}
		const db = getDb();
		const before = await db.query.categories.findFirst({ where: eq(categories.id, id) });
		await db
			.update(categories)
			.set({ ...values, slug: toSlug(values.name, 40) })
			.where(eq(categories.id, id));
		await audit(db, {
			adminId: admin.id,
			action: 'category:update',
			targetType: 'category',
			targetId: String(id),
			before,
			after: values
		});
		await revalidateCategory(event, [id]);
		return { saved: 'Gespeichert.' };
	},

	/** Recipes of the category move to the replacement first */
	delete: async (event) => {
		const admin = await requireAdmin(event);
		const form = await event.request.formData();
		const id = Number(form.get('id'));
		const replacement = Number(form.get('replacement'));
		const db = getDb();
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(recipes)
			.where(eq(recipes.categoryId, id));
		if (count && (!replacement || replacement === id)) {
			return fail(400, { error: 'Bitte wähle eine Ersatzkategorie für die Rezepte.' });
		}
		if (count) {
			await db.update(recipes).set({ categoryId: replacement }).where(eq(recipes.categoryId, id));
			await revalidateCategory(event, [replacement]);
		}
		const before = await db.query.categories.findFirst({ where: eq(categories.id, id) });
		await db.delete(categories).where(eq(categories.id, id));
		await audit(db, {
			adminId: admin.id,
			action: 'category:delete',
			targetType: 'category',
			targetId: String(id),
			before,
			after: { replacement }
		});
		return { saved: 'Gelöscht.' };
	}
};
