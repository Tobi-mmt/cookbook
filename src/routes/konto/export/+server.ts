import { exportAccount } from '#lib/server/accounts.js';
import { requireUser } from '#lib/server/auth/guards.js';
import { getDb } from '#lib/server/context.js';

export async function GET(event) {
	const user = await requireUser(event);
	return new Response(JSON.stringify(await exportAccount(getDb(), user.id), null, 2), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'content-disposition': `attachment; filename="kochbuch-${user.username}.json"`,
			'cache-control': 'private, no-store'
		}
	});
}
