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
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-eval', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'object-src': ['none'],
				'base-uri': ['none'],
				'style-src': ['self', 'unsafe-inline']
			}
		}
	}
};

export default config;
