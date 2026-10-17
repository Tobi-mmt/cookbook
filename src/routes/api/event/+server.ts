import { z } from 'zod';
import { getDb } from '#lib/server/context.js';
import { isBot, normalizePath, normalizeReferrer, recordPageView } from '#lib/server/tracking.js';

const eventSchema = z.object({
	path: z.string(),
	entry: z.boolean().optional(),
	referrer: z.string().max(2000).optional()
});

/** Receives the page view beacon from the layout, see `src/lib/server/tracking.ts` */
export async function POST({ request, url, getClientAddress }) {
	const userAgent = request.headers.get('user-agent');
	const event = eventSchema.safeParse(await request.json().catch(() => null));
	const path = event.success ? normalizePath(event.data.path) : null;

	if (path && userAgent && !isBot(userAgent)) {
		await recordPageView(getDb(), {
			path,
			host: url.host,
			ip: getClientAddress(),
			userAgent,
			referrer: event.data?.entry ? (normalizeReferrer(event.data.referrer, url.host) ?? '') : null
		});
	}

	return new Response(null, { status: 204 });
}
