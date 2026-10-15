<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavigationLoader from '#components/NavigationLoader.svelte';
	import DeletionBanner from '#components/DeletionBanner.svelte';
	import Footer from '#components/Footer.svelte';
	import TopBar from '#components/TopBar.svelte';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { me } from '#lib/me.svelte.js';
	import { page } from '$app/state';
	import '#lib/styles/ui.css';
	// imported, so that the file name has a hash and the browser caches it for a year
	import robotoRegular from '#lib/assets/fonts/roboto/roboto-v29-latin-regular.woff2';

	let { children }: { children: Snippet } = $props();

	onMount(() => me.load());

	// cookieless page view tracking, see src/lib/server/tracking.ts
	afterNavigate(({ to, shallow }) => {
		// shallow navigations only change the recipe filter, the page stays the same
		if (shallow) return;
		if (!to || to.url.pathname.startsWith('/admin') || navigator.webdriver) return;
		navigator.sendBeacon('/api/event', JSON.stringify({ path: to.url.pathname }));
	});
</script>

<svelte:head>
	<!-- the regular weight is used everywhere, loading it early avoids a visible font swap -->
	<link rel="preload" href={robotoRegular} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div>
	{#if !page.url.pathname.startsWith('/admin')}
		<!-- the pages come from the cache and are preloaded, it only shows on slow connections -->
		<NavigationLoader delay={250} color="var(--color-dark)" />
	{/if}
	<TopBar />
	<DeletionBanner />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	/* only woff2, every browser that runs the app supports it */
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 100;
		src: url('../lib/assets/fonts/roboto/roboto-v29-latin-100.woff2') format('woff2');
		font-display: swap;
	}
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 400;
		src: url('../lib/assets/fonts/roboto/roboto-v29-latin-regular.woff2') format('woff2');
		font-display: swap;
	}
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 700;
		src: url('../lib/assets/fonts/roboto/roboto-v29-latin-700.woff2') format('woff2');
		font-display: swap;
	}

	/* design tokens of the public pages */
	:global(:root) {
		--color-text: #222;
		--color-text-muted: #555;
		--color-text-subtle: #888;
		--color-border: #ddd;
		--color-surface: #fff;
		--color-surface-muted: #f5f5f5;
		--color-dark: #27343a;
		--color-focus: #27343a;
		--radius-sm: 4px;
		--radius-md: 8px;
		--radius-pill: 999px;
		--top-bar-height: 4.5rem;
	}

	:global(html, body) {
		font-size: 16px;
		padding: 0;
		margin: 0;
		font-family: Roboto, sans-serif;
		color: var(--color-text);
	}
	:global(p) {
		margin: 0.5em 0;
	}

	:global(*) {
		box-sizing: border-box;
	}
	:global(:focus-visible) {
		outline: 3px solid var(--color-focus);
		outline-offset: 2px;
	}
	@media only screen and (max-width: 800px) {
		:global(html, body) {
			font-size: 18px;
		}
	}

	@media print {
		:global(body) {
			font-size: 12pt;
		}
		:global(a:link:after) {
			content: ' (' attr(href) ') ';
		}
	}
</style>
