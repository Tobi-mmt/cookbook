import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE, verifySession } from '$lib/server/auth';
import { getDb } from '$lib/server/context';
import { isBot, normalizePath, recordPageView } from '$lib/server/tracking';

const eventSchema = z.object({ path: z.string() });

/** Receives the page view beacon from the layout, see `src/lib/server/tracking.ts` */
export async function POST({ request, url, cookies, getClientAddress }) {
	const userAgent = request.headers.get('user-agent');
	const event = eventSchema.safeParse(await request.json().catch(() => null));
	const path = event.success ? normalizePath(event.data.path) : null;
	const isAdmin = verifySession(cookies.get(SESSION_COOKIE), env.SESSION_SECRET);

	if (path && userAgent && !isBot(userAgent) && !isAdmin) {
		await recordPageView(getDb(), {
			path,
			host: url.host,
			ip: getClientAddress(),
			userAgent
		});
	}

	return new Response(null, { status: 204 });
}
