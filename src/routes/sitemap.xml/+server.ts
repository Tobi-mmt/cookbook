/** @type {import('@sveltejs/kit').RequestHandler} */
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

export async function get() {
	return {
		status: 200,
		headers: {
			'access-control-allow-origin': '*',
			'Content-Type': 'text/xml'
		},
		body: generateSiteMap()
	};
}
