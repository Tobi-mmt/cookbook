import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireEditor } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { recipes } from '#lib/server/db/schema.js';
import { requestReview } from '#lib/server/moderation/decisions.js';

/** Editors corrected a hidden recipe or cookbook and ask the moderation to look again */
export async function POST(event) {
	const { type, id } = await event.request.json();
	if (type !== 'recipe' && type !== 'cookbook') error(400, 'Unbekannter Inhalt');
	const db = getDb();
	const cookbookId =
		type === 'cookbook'
			? id
			: (await db.query.recipes.findFirst({ where: eq(recipes.id, id) }))?.cookbookId;
	if (!cookbookId) error(404, 'Nicht gefunden');
	await requireEditor(event, cookbookId);
	return Response.json({ reopened: await requestReview(db, type, id) });
}
