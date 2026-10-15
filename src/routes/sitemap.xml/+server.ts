import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { listSitemapPaths, sitemapIndex, URLS_PER_SITEMAP } from '#lib/server/sitemap.js';

export const config = isrConfig;

/** A sitemap index, so that the sitemaps stay below the limits with many recipes */
export async function GET({ url }) {
	const count = Math.max(1, Math.ceil((await listSitemapPaths(getDb())).length / URLS_PER_SITEMAP));
	return new Response(sitemapIndex(url.origin, count), {
		headers: { 'content-type': 'application/xml' }
	});
}
