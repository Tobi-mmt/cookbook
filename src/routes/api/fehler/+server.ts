import { z } from 'zod';
import { getDb } from '#lib/server/context.js';
import { reportError } from '#lib/server/errorReporting.js';
import { hitRateLimit } from '#lib/server/rateLimit.js';
import { hashIp } from '#lib/server/secret.js';
import { isBot, parseUserAgent } from '#lib/server/tracking.js';

const reportSchema = z.object({
	name: z.string().max(200),
	message: z.string().max(2000),
	stack: z.string().max(10000).optional(),
	path: z.string().startsWith('/').max(500)
});

/**
 * Errors of the browser, see `src/hooks.client.ts`. They go through here instead of straight
 * to Bugsink, so that the DSN stays private and the browser only talks to this site.
 */
export async function POST({ request, getClientAddress }) {
	const userAgent = request.headers.get('user-agent');
	const report = reportSchema.safeParse(await request.json().catch(() => null));
	if (!report.success || isBot(userAgent)) return new Response(null, { status: 204 });

	const allowed = await hitRateLimit(
		getDb(),
		`error-report:${hashIp(getClientAddress())}`,
		20,
		3600
	);
	if (allowed) {
		await reportError({
			...report.data,
			path: report.data.path.split(/[?#]/)[0],
			runtime: 'browser',
			tags: userAgent ? parseUserAgent(userAgent) : undefined
		});
	}
	return new Response(null, { status: 204 });
}
