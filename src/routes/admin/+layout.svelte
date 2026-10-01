<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="admin">
	{#if !$page.url.pathname.startsWith('/admin/login')}
		<header class="admin-header">
			<a href={resolve('/admin', {})} class="admin-title">Kochbuch verwalten</a>
			<nav>
				<a href={resolve('/', {})} target="_blank">Zur Webseite</a>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="button">Abmelden</button>
				</form>
			</nav>
		</header>
	{/if}
	{@render children()}
</div>

<style>
	.admin {
		max-width: 1100px;
		margin: 0 auto;
		padding: 1em 1.5em 4em;
	}
	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1em;
		border-bottom: 1px solid #ddd;
		padding-bottom: 1em;
		margin-bottom: 1.5em;
	}
	.admin-title {
		font-size: 1.4em;
		font-weight: 200;
		color: inherit;
		text-decoration: none;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1em;
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
