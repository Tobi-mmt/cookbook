import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const UNGUARDED_SCROLL = 'history_info[index].scroll = scroll_state();';

/**
 * SvelteKit 3.1 reads the scroll position of a history entry it may not know, e.g. after
 * Firefox on Android restored a tab, and throws on going back. Remove once fixed upstream.
 */
const guardScrollCapture = () => ({
	name: 'guard-scroll-capture',
	enforce: 'pre',
	transform(code, id) {
		if (!id.includes('@sveltejs/kit/src/runtime/client/client.js')) return;
		if (!code.includes(UNGUARDED_SCROLL)) {
			this.warn(
				'SvelteKit changed capture_scroll, check whether guard-scroll-capture is still needed'
			);
			return;
		}
		return code.replace(UNGUARDED_SCROLL, `if (history_info[index]) ${UNGUARDED_SCROLL}`);
	}
});

export default defineConfig({
	plugins: [
		guardScrollCapture(),
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
