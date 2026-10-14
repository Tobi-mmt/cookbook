<script lang="ts">
	import type { Snippet } from 'svelte';
	import TopBar from '#components/TopBar.svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();

	// cookieless page view tracking, see src/lib/server/tracking.ts
	afterNavigate(({ to, shallow }) => {
		// shallow navigations only change the recipe filter, the page stays the same
		if (shallow) return;
		if (!to || to.url.pathname.startsWith('/admin') || navigator.webdriver) return;
		navigator.sendBeacon('/api/event', JSON.stringify({ path: to.url.pathname }));
	});
</script>

<div>
	{#if !page.url.pathname.startsWith('/admin')}
		<TopBar />
	{/if}
	<main>
		{@render children()}
	</main>
</div>

<style>
	/* only woff2, every browser that runs the app supports it */
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 100;
		src: url('/fonts/roboto/roboto-v29-latin-100.woff2') format('woff2');
		font-display: swap;
	}
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 400;
		src: url('/fonts/roboto/roboto-v29-latin-regular.woff2') format('woff2');
		font-display: swap;
	}
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 700;
		src: url('/fonts/roboto/roboto-v29-latin-700.woff2') format('woff2');
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
