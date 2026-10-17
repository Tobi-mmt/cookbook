import { getDb } from '#lib/server/context.js';
import { listLandings } from '#lib/server/landings.js';

export const config = { isr: { expiration: 3600 } };

export async function load() {
	return { landings: await listLandings(getDb()) };
}
