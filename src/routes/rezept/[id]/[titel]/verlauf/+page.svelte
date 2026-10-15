<script lang="ts">
	import type { Recipe } from '#types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import RecipeComponent from '#components/Recipe.svelte';
	import { recipePath } from '#lib/paths.js';
	import type { Conflict } from '#lib/server/recipeActions.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			recipe: Recipe;
			currentVersion?: number;
			versions: { version: number; createdAt: Date; author: string | null }[];
			selected?: number;
			preview?: Recipe;
		};
		form: { conflict?: Conflict } | null;
	} = $props();

	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
</script>

<svelte:head>
	<title>Verlauf von {data.recipe.title} - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Verlauf</h1>
	<p class="hint">
		Die letzten 20 Versionen von <a href={recipePath(data.recipe)}>{data.recipe.title}</a>.
		Wiederherstellen legt eine neue Version an und lässt sich selbst rückgängig machen.
	</p>
	<ol class="versions">
		{#each data.versions as item (item.version)}
			<li>
				<a
					href="{page.url.pathname}?version={item.version}"
					aria-current={item.version === data.selected ? 'true' : undefined}
				>
					{formatDate(item.createdAt)} – {item.author ?? 'ehemalige Person'}
					{#if item.version === data.currentVersion}<span class="current">aktuell</span>{/if}
				</a>
			</li>
		{:else}
			<li class="hint">Noch keine gespeicherten Versionen.</li>
		{/each}
	</ol>

	{#if data.selected && data.selected !== data.currentVersion}
		<form method="POST" action="?/restore" use:enhance class="stack">
			<input type="hidden" name="version" value={data.selected} />
			<input type="hidden" name="baseVersion" value={data.currentVersion} />
			{#if form?.conflict}
				<p class="message message--error" role="alert">
					{form.conflict.by ?? 'Jemand'} hat das Rezept inzwischen geändert. Lade die Seite neu und prüfe
					den Verlauf noch einmal.
				</p>
			{/if}
			<button type="submit" class="btn btn--primary">Diese Version wiederherstellen</button>
		</form>
	{/if}
</div>

{#if data.preview}
	<div class="preview">
		<p class="preview-label">Vorschau</p>
		<RecipeComponent recipe={data.preview} />
	</div>
{/if}

<style>
	.versions {
		margin: 1.5rem 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.versions a {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 0.25rem;
		color: var(--color-text);
		text-decoration: none;
		border-bottom: 1px solid var(--color-border);
	}
	.versions a[aria-current] {
		font-weight: 700;
	}
	.current {
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--color-text-subtle);
	}
	.hint a {
		color: inherit;
	}
	.preview {
		border-top: 1px solid var(--color-border);
	}
	.preview-label {
		margin: 0;
		padding: 0.5rem 1.5rem;
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
	}
</style>
