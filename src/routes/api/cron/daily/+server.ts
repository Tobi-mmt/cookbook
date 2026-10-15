import { error } from '@sveltejs/kit';
import { CRON_SECRET } from '$app/env/private';
import { getDb, getStorage } from '#lib/server/context.js';
import { runDailyJob } from '#lib/server/dailyJob.js';

/** Vercel cron, see vercel.json */
export async function GET({ request, url }) {
	if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
		error(401, 'Unauthorized');
	}
	return Response.json(await runDailyJob(getDb(), getStorage(), { origin: url.origin }));
}

export const config = { maxDuration: 60 };
