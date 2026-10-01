import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { slugerize } from '../slugerize';

/** All public paths that show the given recipe, including the client-side navigation data */
export const recipePaths = (recipe: { id: string; title: string }) => [
	`/recipe/${recipe.id}/${slugerize(recipe.title)}`
];

export const LIST_PATHS = ['/', '/api/recipe-index.json', '/sitemap.xml'];

/**
 * Asks Vercel to re-render the given ISR paths in the background.
 * Returns the paths that could not be revalidated.
 */
export const revalidate = async (origin: string, paths: string[]): Promise<string[]> => {
	if (dev) return [];
	if (!env.ISR_BYPASS_TOKEN) {
		console.warn('ISR_BYPASS_TOKEN is not set, pages update after the ISR expiration');
		return paths;
	}

	// pages are also cached as `__data.json` for client-side navigations
	const urls = paths.flatMap((path) =>
		path.startsWith('/api/') || path.endsWith('.xml')
			? [path]
			: [path, `${path === '/' ? '' : path}/__data.json`]
	);

	const results = await Promise.allSettled(
		urls.map(async (path) => {
			const response = await fetch(new URL(path, origin), {
				method: 'HEAD',
				headers: { 'x-prerender-revalidate': env.ISR_BYPASS_TOKEN! }
			});
			if (!response.ok && response.status !== 404) throw new Error(`${response.status}`);
		})
	);

	const failed = urls.filter((_, index) => results[index].status === 'rejected');
	if (failed.length) console.error('Revalidation failed for', failed);
	return failed;
};
