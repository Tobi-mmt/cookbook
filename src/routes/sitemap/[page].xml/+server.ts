import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/context.js';
import { isrConfig } from '#lib/server/isr.js';
import { listSitemapPaths, sitemapPage, URLS_PER_SITEMAP } from '#lib/server/sitemap.js';

export const config = isrConfig;

export async function GET({ params, url }) {
	const page = Number(params.page);
	if (!Number.isInteger(page) || page < 0) error(404, 'Not found');
	const entries = (await listSitemapPaths(getDb())).slice(
		page * URLS_PER_SITEMAP,
		(page + 1) * URLS_PER_SITEMAP
	);
	if (!entries.length && page > 0) error(404, 'Not found');
	return new Response(sitemapPage(url.origin, entries), {
		headers: { 'content-type': 'application/xml' }
	});
}
