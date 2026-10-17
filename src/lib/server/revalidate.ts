import { dev } from '$app/env';
import { ISR_BYPASS_TOKEN } from '$app/env/private';
import { slugerize } from '../slugerize';

/** All public paths that show the given recipe, including the client-side navigation data */
export const recipePaths = (recipe: { id: string; title: string }) => [
	`/rezept/${recipe.id}/${slugerize(recipe.title)}`,
	`/rezept/${recipe.id}.md`
];

export const LIST_PATHS = ['/', '/sitemap.xml', '/sitemap/0.xml'];

const CONCURRENCY = 10;

/**
 * Asks Vercel to re-render the given ISR paths in the background.
 * Returns the paths that could not be revalidated.
 */
export const revalidate = async (origin: string, paths: string[]): Promise<string[]> => {
	if (dev) return [];
	if (!ISR_BYPASS_TOKEN) {
		console.warn('ISR_BYPASS_TOKEN is not set, pages update with the next cache warm-up');
		return paths;
	}

	// pages are also cached as `__data.json` for client-side navigations
	const urls = paths.flatMap((path) =>
		path.startsWith('/api/') || /\.(xml|md|txt)$/.test(path)
			? [path]
			: [path, `${path === '/' ? '' : path}/__data.json`]
	);

	// a few at a time, warming the cache renders every page at once
	const results: PromiseSettledResult<void>[] = [];
	for (let index = 0; index < urls.length; index += CONCURRENCY) {
		results.push(
			...(await Promise.allSettled(
				urls.slice(index, index + CONCURRENCY).map(async (path) => {
					const response = await fetch(new URL(path, origin), {
						method: 'HEAD',
						headers: { 'x-prerender-revalidate': ISR_BYPASS_TOKEN! }
					});
					if (!response.ok && response.status !== 404) throw new Error(`${response.status}`);
				})
			))
		);
	}

	const failed = urls.filter((_, index) => results[index].status === 'rejected');
	if (failed.length) console.error('Revalidation failed for', failed);
	return failed;
};
