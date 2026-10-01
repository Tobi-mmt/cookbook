import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/context';
import { isrConfig } from '$lib/server/isr';
import { listRecipeIndex } from '$lib/server/recipes';
import { slugerize } from '$lib/slugerize';
import type { RecipeIndexEntry } from '$types';

const BASE_URL = 'https://kochbuch.tobis.app';

export const config = isrConfig;

function generateSiteMap(recipes: RecipeIndexEntry[]) {
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
	return new Response(generateSiteMap(await listRecipeIndex(getDb())), {
		status: 200,
		headers: {
			'access-control-allow-origin': '*',
			'Content-Type': 'text/xml'
		}
	});
};
