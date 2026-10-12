<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	let { children }: { children: Snippet } = $props();

	const isStats = $derived(/^\/admin\/stats(\/|$)/.test($page.url.pathname));
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="admin">
	{#if !$page.url.pathname.startsWith('/admin/login')}
		<header class="admin-header">
			<a href={resolve('/admin', {})} class="admin-title">Kochbuch verwalten</a>
			<nav aria-label="Verwaltung">
				<a href={resolve('/admin', {})} class="nav-link" aria-current={isStats ? undefined : 'page'}
					>Rezepte</a
				>
				<a
					href={resolve('/admin/stats', {})}
					class="nav-link"
					aria-current={isStats ? 'page' : undefined}>Statistik</a
				>
			</nav>
			<div class="header-actions">
				<a href={resolve('/', {})} target="_blank" class="button">Zur Webseite ↗</a>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="button">Abmelden</button>
				</form>
			</div>
		</header>
	{/if}
	{@render children()}
</div>

<style>
	.admin {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5em 4em;
	}
	.admin-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5em 2em;
		background: #fff;
		border-bottom: 1px solid #ddd;
		padding: 1em 0 0;
		margin-bottom: 1.5em;
	}
	.admin-title {
		font-size: 1.4em;
		font-weight: 200;
		color: inherit;
		text-decoration: none;
		padding-bottom: 0.5em;
	}
	nav {
		display: flex;
		align-self: stretch;
		gap: 1.5em;
	}
	.nav-link {
		display: flex;
		align-items: center;
		padding-bottom: 0.5em;
		border-bottom: 3px solid transparent;
		margin-bottom: -1px;
		color: #555;
		text-decoration: none;
	}
	.nav-link:hover {
		color: inherit;
	}
	.nav-link[aria-current='page'] {
		color: inherit;
		font-weight: 700;
		border-bottom-color: #8882a8;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5em;
		margin-left: auto;
		padding-bottom: 0.5em;
	}
	@media (max-width: 700px) {
		.admin-header {
			gap: 0.5em 1em;
		}
		nav {
			order: 3;
			width: 100%;
		}
	}
	.admin :global(input),
	.admin :global(textarea),
	.admin :global(select) {
		font: inherit;
		padding: 0.4em 0.6em;
		border: 1px solid #bbb;
		border-radius: 4px;
		background: #fff;
		min-width: 0;
	}
	.admin :global(input:focus),
	.admin :global(textarea:focus),
	.admin :global(select:focus) {
		outline: 2px solid #8882a8;
		outline-offset: -1px;
	}
	.admin :global(.button) {
		font: inherit;
		font-size: 0.9em;
		padding: 0.4em 0.9em;
		border: 1px solid #bbb;
		border-radius: 4px;
		background: #fff;
		color: inherit;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}
	.admin :global(.button:hover) {
		background: #f3f3f3;
	}
	.admin :global(.button--primary) {
		background: #27343a;
		border-color: #27343a;
		color: #fff;
	}
	.admin :global(.button--primary:hover) {
		background: #3b4c54;
	}
	.admin :global(.button--danger) {
		color: #b3261e;
		border-color: #e3a7a3;
	}
	.admin :global(.button:disabled) {
		opacity: 0.5;
		cursor: default;
	}
	.admin :global(.error) {
		color: #b3261e;
	}
	.admin :global(.notice) {
		background: #eef6ef;
		border: 1px solid #b9dcbf;
		border-radius: 4px;
		padding: 0.75em 1em;
	}
	.admin :global(.warning) {
		background: #fff6e0;
		border: 1px solid #f0d58c;
		border-radius: 4px;
		padding: 0.75em 1em;
	}
</style>
