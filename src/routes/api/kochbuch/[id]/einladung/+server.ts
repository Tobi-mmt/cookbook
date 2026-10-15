import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireEditor } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { cookbooks } from '#lib/server/db/schema.js';
import { inviteToCookbook } from '#lib/server/invitations.js';

/** An invitation link right from the recipe page, optionally sent by mail */
export async function POST(event) {
	const editor = await requireEditor(event, event.params.id);
	const email = String((await event.request.json().catch(() => ({})))?.email ?? '').trim();
	if (email && !z.email().safeParse(email).success) {
		error(400, 'Bitte gib eine gültige E-Mail-Adresse ein.');
	}
	const db = getDb();
	const cookbook = await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, event.params.id) });
	if (!cookbook) error(404, 'Kochbuch nicht gefunden');

	const link = await inviteToCookbook(db, {
		origin: event.url.origin,
		cookbook,
		inviter: editor,
		email: email || undefined
	});
	return Response.json({ link, sentTo: email || null });
}
