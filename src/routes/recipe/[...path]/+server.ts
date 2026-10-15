import { redirect } from '@sveltejs/kit';

/** Links from before the platform, e.g. shared on WhatsApp */
export function GET({ params, url }) {
	redirect(301, `/rezept/${params.path}${url.search}`);
}
