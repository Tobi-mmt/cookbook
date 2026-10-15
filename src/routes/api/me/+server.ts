import { getDb } from '#lib/server/context.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';

/** What the cached pages personalize in the browser, never cached itself */
export async function GET({ locals }) {
	const session = await locals.getSession();
	const user = session?.user.username
		? { username: session.user.username, name: session.user.name, role: session.user.role }
		: null;
	return Response.json(
		{
			user,
			cookbooks: user ? await listEditableCookbooks(getDb(), session!.user.id) : [],
			needsOnboarding: Boolean(session && !user)
		},
		{ headers: { 'cache-control': 'private, no-store' } }
	);
}
