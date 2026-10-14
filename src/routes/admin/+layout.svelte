<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LogOut from '@lucide/svelte/icons/log-out';

	let { children }: { children: Snippet } = $props();

	const isStats = $derived(/^\/admin\/stats(\/|$)/.test(page.url.pathname));
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="admin">
	{#if !page.url.pathname.startsWith('/admin/login')}
		<header class="admin-header">
			<a href={resolve('/admin')} class="admin-title">Kochbuch verwalten</a>
			<nav aria-label="Verwaltung">
				<a href={resolve('/admin')} class="nav-link" aria-current={isStats ? undefined : 'page'}
					>Rezepte</a
				>

				<a
					href={resolve('/admin/stats')}
					class="nav-link"
					aria-current={isStats ? 'page' : undefined}>Statistik</a
				>
			</nav>
			<div class="header-actions">
				<a href={resolve('/')} target="_blank" class="button" title="Zur Webseite">
					<ExternalLink size={18} aria-hidden="true" /><span class="label">Zur Webseite</span>
				</a>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="button" title="Abmelden">
						<LogOut size={18} aria-hidden="true" /><span class="label">Abmelden</span>
					</button>
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
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
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
		color: var(--color-text-muted);
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
		.admin {
			padding: 0 1em 4em;
		}
		.admin-header {
			gap: 0.5em 1em;
		}
		.admin-title {
			font-size: 1.2em;
		}
		nav {
			order: 3;
			width: 100%;
		}
		/* icons only, the title attribute and the screen reader text keep the meaning */
		.header-actions .label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}
	.admin :global(input),
	.admin :global(textarea),
	.admin :global(select) {
		font: inherit;
		padding: 0.4em 0.6em;
		border: 1px solid #bbb;
		border-radius: var(--radius-sm);
		background: var(--color-surface);
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
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		min-height: 2.4em;
		border: 1px solid #bbb;
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: inherit;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
	}
	.admin :global(.button--icon) {
		padding: 0.4em;
		min-width: 2.4em;
	}
	.admin :global(.button:hover) {
		background: var(--color-surface-muted);
	}
	.admin :global(.button--primary) {
		background: var(--color-dark);
		border-color: var(--color-dark);
		color: #fff;
	}
	.admin :global(.button--primary:hover) {
		background: var(--color-text-muted);
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
		border-radius: var(--radius-sm);
		padding: 0.75em 1em;
	}
	.admin :global(.warning) {
		background: #fff6e0;
		border: 1px solid #f0d58c;
		border-radius: var(--radius-sm);
		padding: 0.75em 1em;
	}
</style>
