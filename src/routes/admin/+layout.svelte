<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import NavigationLoader from '#components/NavigationLoader.svelte';

	let { children }: { children: Snippet } = $props();
	let loading = $state(false);

	const sections = [
		{ href: resolve('/admin'), label: 'Übersicht', exact: true },
		{ href: resolve('/admin/meldungen'), label: 'Meldungen' },
		{ href: resolve('/admin/personen'), label: 'Personen' },
		{ href: resolve('/admin/kochbuecher'), label: 'Kochbücher' },
		{ href: resolve('/admin/rezepte'), label: 'Rezepte' },
		{ href: resolve('/admin/stats'), label: 'Statistik' }
	];
	const isCurrent = (section: (typeof sections)[number]) => {
		const path = page.url.pathname;
		const href = new URL(section.href, page.url.href).pathname;
		return section.exact ? path === href : path.startsWith(href);
	};
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="admin">
	<header>
		<p class="title">Verwaltung</p>
		<nav aria-label="Verwaltung">
			{#each sections as section (section.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() -->
				<a href={section.href} aria-current={isCurrent(section) ? 'page' : undefined}
					>{section.label}</a
				>
			{/each}
		</nav>
	</header>
	<NavigationLoader delay={150} color="var(--color-dark)" bind:loading />
	<div class="content" class:content--loading={loading} aria-busy={loading}>
		{@render children()}
	</div>
</div>

<style>
	.admin {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem 4rem;
	}
	header {
		padding-top: 1.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}
	.title {
		margin: 0 0 0.75rem;
		font-size: 1.5rem;
		font-weight: 400;
	}
	nav {
		display: flex;
		gap: 1.5rem;
		overflow-x: auto;
		scrollbar-width: none;
	}
	nav a {
		flex: none;
		padding-bottom: 0.6rem;
		margin-bottom: -1px;
		color: var(--color-text-muted);
		text-decoration: none;
		border-bottom: 2px solid transparent;
	}
	nav a[aria-current='page'] {
		color: var(--color-text);
		border-bottom-color: var(--color-dark);
	}
	.content {
		transition: opacity 0.2s;
	}
	/* the old page stays visible but dimmed until the new one is there */
	.content--loading {
		opacity: 0.5;
		pointer-events: none;
	}
	.admin :global(h1) {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 400;
	}
	.admin :global(.table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}
	.admin :global(.table th),
	.admin :global(.table td) {
		padding: 0.5rem 0.4rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-border);
	}
	.admin :global(.table th) {
		font-weight: 400;
		color: var(--color-text-subtle);
	}
	.admin :global(.table a) {
		color: var(--color-text);
	}
	.admin :global(.cards) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 1rem;
	}
	.admin :global(.card) {
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.admin :global(.card strong) {
		display: block;
		font-size: 1.75rem;
		font-weight: 400;
	}
	@media (max-width: 700px) {
		.admin {
			padding: 0 1rem 3rem;
		}
	}
</style>
