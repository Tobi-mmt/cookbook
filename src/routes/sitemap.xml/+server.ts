import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import {
	listSitemapPaths,
	sitemapIndex,
	sitemapPage,
	URLS_PER_SITEMAP
} from '#lib/server/sitemap.js';

export const config = isrConfig;

/**
 * Lists the pages directly as long as they fit into one sitemap. Search engines read it with a
 * single request, Google left the child sitemaps of an index unread for weeks. Only with more
 * pages it becomes a sitemap index, so that the sitemaps stay below the limits.
 */
export async function GET({ url }) {
	const paths = await listSitemapPaths(getDb());
	const body =
		paths.length <= URLS_PER_SITEMAP
			? sitemapPage(url.origin, paths)
			: sitemapIndex(url.origin, Math.ceil(paths.length / URLS_PER_SITEMAP));
	return new Response(body, { headers: { 'content-type': 'application/xml' } });
}
