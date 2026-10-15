import { error } from '@sveltejs/kit';
import { requireUser } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';
import { createCookbook } from '#lib/server/cookbooks.js';
import { revalidate } from '#lib/server/revalidate.js';

/** A new cookbook from the menu */
export async function POST(event) {
	const user = await requireUser(event);
	const name = String((await event.request.json().catch(() => ({})))?.name ?? '').trim();
	if (!name || name.length > 80) error(400, 'Bitte gib einen Namen mit höchstens 80 Zeichen an.');
	const { slug } = await createCookbook(getDb(), user.id, name);
	await revalidate(event.url.origin, [`/@${user.username}`]);
	return Response.json({ path: `/@${user.username}/${slug}` });
}
