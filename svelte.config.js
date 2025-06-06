import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-eval', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'object-src': ['none'],
				'base-uri': ['none'],
				'style-src': ['self', 'unsafe-inline']
			}
		},
		alias: {
			$components: './src/components',
			$routes: './src/routes',
			$types: './src/types',
			$utils: './src/utils'
		}
	}
};

export default config;
