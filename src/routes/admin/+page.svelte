<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RecipeIndexEntry } from '#types';
	import { recipePath } from '#lib/paths.js';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Pencil from '@lucide/svelte/icons/pencil';

	let { data }: { data: { recipes: RecipeIndexEntry[] } } = $props();
</script>

<svelte:head>
	<title>Rezepte verwalten - Kochbuch</title>
</svelte:head>

<h1>Rezepte ({data.recipes.length})</h1>
<p class="hint">Rezepte werden jetzt direkt am Rezept bearbeitet.</p>

<ul class="recipes">
	{#each data.recipes as recipe (recipe.id)}
		<li class="recipe" style="--color: {recipe.meta.category.color}">
			<a class="recipe-title" href={recipePath(recipe)}>
				{recipe.title}
				<span class="recipe-meta">{recipe.meta.category.name} · {recipe.meta.nutritionType}</span>
			</a>
			<div class="actions">
				<a
					class="button button--icon"
					href={recipePath(recipe)}
					target="_blank"
					rel="noreferrer"
					aria-label="„{recipe.title}“ ansehen"
					title="Ansehen"><ExternalLink size={18} aria-hidden="true" /></a
				>
				<a
					class="button button--icon"
					href={resolve('/rezept/[id]/[titel]/bearbeiten', {
						id: recipe.id,
						titel: encodeURIComponent(recipe.title.replace(/ /g, '-'))
					})}
					aria-label="„{recipe.title}“ bearbeiten"
					title="Bearbeiten"><Pencil size={18} aria-hidden="true" /></a
				>
			</div>
		</li>
	{/each}
</ul>

<style>
	h1 {
		font-weight: 200;
	}
	.hint {
		color: #777;
	}
	.recipes {
		list-style: none;
		padding: 0;
		margin: 1em 0 0;
	}
	.recipe {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
		padding: 0.6em 0 0.6em 0.75em;
		border-bottom: 1px solid #eee;
		border-left: 4px solid var(--color);
	}
	.recipe-title {
		display: flex;
		flex-direction: column;
		color: inherit;
		text-decoration: none;
	}
	.recipe-meta {
		font-size: 0.8em;
		color: #888;
	}
	.actions {
		display: flex;
		gap: 0.4em;
	}
</style>
