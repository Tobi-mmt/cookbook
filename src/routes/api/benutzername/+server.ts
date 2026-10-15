import { getDb } from '#lib/server/context.js';
import { isUsernameAvailable } from '#lib/server/users.js';
import { validateUsername } from '#lib/username.js';

/** Live check while somebody types a username */
export async function GET({ url, locals }) {
	const username = (url.searchParams.get('name') ?? '').trim().toLowerCase();
	const error =
		validateUsername(username) ??
		((await isUsernameAvailable(getDb(), username, (await locals.getSession())?.user.id))
			? null
			: 'Schon vergeben');
	return Response.json({ error }, { headers: { 'cache-control': 'no-store' } });
}
