/** Points to the sitemap of whatever domain the app runs on */
export function GET({ url }) {
	return new Response(
		`User-agent: *\nDisallow: /admin\nDisallow: /konto\nDisallow: /api/\nSitemap: ${url.origin}/sitemap.xml\n`,
		{ headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=86400' } }
	);
}
