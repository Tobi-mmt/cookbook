import { getDb } from '#lib/server/context.js';
import { loadHome } from '#lib/server/home.js';
import { isrConfig } from '#lib/server/isr.js';

export const config = isrConfig;

export async function load() {
	return loadHome(getDb());
}
