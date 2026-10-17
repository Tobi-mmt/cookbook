import { getDb } from '#lib/server/context.js';
import { LIMITS, measureUsage } from '#lib/server/costs.js';

export const config = { isr: { expiration: 3600 } };

export async function load() {
	return { usage: await measureUsage(getDb()), limits: LIMITS };
}
