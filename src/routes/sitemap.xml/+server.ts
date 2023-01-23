import type { RequestHandler } from '@sveltejs/kit';
import { recipes } from '$lib/recipes';
import { slugerize } from '$lib/slugerize';

const BASE_URL = 'https://kochbuch.tobis.app';

function generateSiteMap() {
	return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${BASE_URL}/</loc>
     </url>
     ${recipes
				.map(({ id, title }) => {
					return `
       <url>
           <loc>${`${BASE_URL}/recipe/${id}/${slugerize(title)}`}</loc>
       </url>
     `;
				})
				.join('')}
   </urlset>
 `;
}

export const GET: RequestHandler = async () => {
	return new Response(generateSiteMap(), {
		status: 200,
		headers: {
			'access-control-allow-origin': '*',
			'Content-Type': 'text/xml'
		}
	});
};
