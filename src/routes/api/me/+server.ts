import { getDb } from '#lib/server/context.js';
import { eq } from 'drizzle-orm';
import { deletionDate } from '#lib/server/accounts.js';
import { listEditableCookbooks } from '#lib/server/cookbooks.js';
import { users } from '#lib/server/db/schema.js';

/** What the cached pages personalize in the browser, never cached itself */
export async function GET({ locals }) {
	const session = await locals.getSession();
	const db = getDb();
	const row = session?.user.username
		? await db.query.users.findFirst({
				where: eq(users.id, session.user.id),
				columns: { deletionRequestedAt: true }
			})
		: undefined;
	const user = session?.user.username
		? {
				username: session.user.username,
				name: session.user.name,
				role: session.user.role,
				deletionAt: row?.deletionRequestedAt ? deletionDate(row.deletionRequestedAt) : null
			}
		: null;
	return Response.json(
		{
			user,
			cookbooks: user ? await listEditableCookbooks(db, session!.user.id) : [],
			needsOnboarding: Boolean(session && !user)
		},
		{ headers: { 'cache-control': 'private, no-store' } }
	);
}
