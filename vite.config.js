import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),

			// close to the database, the default region is in the US
			adapter: adapter({ regions: ['fra1'] }),

			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:', 'blob:', 'https://*.public.blob.vercel-storage.com'],
					'object-src': ['none'],
					'base-uri': ['none'],
					'style-src': ['self', 'unsafe-inline']
				}
			}
		})
	]
});
