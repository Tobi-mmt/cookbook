import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: vercel(),
		csp: {
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-eval'],
				'img-src': ['self', 'data:'],
				'object-src': ['none'],
				'base-uri': ['none']
			}
		}
	}
};

export default config;
