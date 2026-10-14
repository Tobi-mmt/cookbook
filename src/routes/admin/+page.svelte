<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RecipeIndexEntry } from '#types';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { categoryColors } from '#lib/colors.js';
	import { slugerize } from '#lib/slugerize.js';
	import Check from '@lucide/svelte/icons/check';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

	let { data, form }: { data: { recipes: RecipeIndexEntry[] }; form: { error?: string } | null } =
		$props();

	let confirmDelete = $state<string | null>(null);

	const saved = $derived(data.recipes.find(({ id }) => id === page.url.searchParams.get('saved')));
	const deleted = $derived(page.url.searchParams.has('deleted'));
	const revalidateFailed = $derived(page.url.searchParams.has('revalidateFailed'));
</script>

<svelte:head>
	<title>Rezepte verwalten - Unser Kochbuch</title>
</svelte:head>

<div class="toolbar">
	<h1>Rezepte ({data.recipes.length})</h1>
	<div class="toolbar-actions">
		<a href={resolve('/admin/recipes/import')} class="button">
			<Download size={18} aria-hidden="true" /> Importieren
		</a>
		<a href={resolve('/admin/recipes/new')} class="button button--primary">
			<Plus size={18} aria-hidden="true" /> Neues Rezept
		</a>
	</div>
</div>

{#if saved}
	<p class="notice">„{saved.title}“ wurde gespeichert und ist in wenigen Sekunden online.</p>
{:else if deleted}
	<p class="notice">Das Rezept wurde gelöscht.</p>
{/if}
{#if revalidateFailed}
	<p class="warning">
		Die Webseite konnte nicht sofort aktualisiert werden. Die Änderung erscheint spätestens nach 24
		Stunden.
	</p>
{/if}
{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<ul class="recipes">
	{#each data.recipes as recipe (recipe.id)}
		<li class="recipe" style="--color: {categoryColors[recipe.meta.category]}">
			<a class="recipe-title" href={resolve('/admin/recipes/[id]', { id: recipe.id })}>
				{recipe.title}
				<span class="recipe-meta">{recipe.meta.category} · {recipe.meta.nutritionType}</span>
			</a>
			<div class="actions">
				{#if confirmDelete === recipe.id}
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={recipe.id} />
						<button type="submit" class="button button--danger">
							<Check size={18} aria-hidden="true" /> Löschen
						</button>
					</form>
					<button
						type="button"
						class="button button--icon"
						aria-label="Abbrechen"
						title="Abbrechen"
						onclick={() => (confirmDelete = null)}><X size={18} aria-hidden="true" /></button
					>
				{:else}
					<a
						class="button button--icon"
						href={resolve('/recipe/[...recipeSlug]', {
							recipeSlug: `${recipe.id}/${slugerize(recipe.title)}`
						})}
						target="_blank"
						rel="noreferrer"
						aria-label="„{recipe.title}“ ansehen"
						title="Ansehen"><ExternalLink size={18} aria-hidden="true" /></a
					>
					<a
						class="button button--icon"
						href={resolve('/admin/recipes/[id]', { id: recipe.id })}
						aria-label="„{recipe.title}“ bearbeiten"
						title="Bearbeiten"><Pencil size={18} aria-hidden="true" /></a
					>
					<button
						type="button"
						class="button button--icon button--danger"
						aria-label="„{recipe.title}“ löschen"
						title="Löschen"
						onclick={() => (confirmDelete = recipe.id)}
						><Trash2 size={18} aria-hidden="true" /></button
					>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5em 1em;
	}
	.toolbar-actions {
		display: flex;
		gap: 0.5em;
	}
	h1 {
		font-weight: 200;
		margin: 0.5em 0;
	}
	.recipes {
		list-style: none;
		padding: 0;
		margin: 1em 0 0;
		border-top: 2px solid #ddd;
	}
	.recipe {
		display: flex;
		align-items: center;
		gap: 0.5em 1em;
		padding: 0.5em 0 0.5em 0.75em;
		border-bottom: 1px solid #eee;
		border-left: 4px solid var(--color);
	}
	.recipe-title {
		flex: 1;
		min-width: 0;
		color: inherit;
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.recipe-title:hover {
		text-decoration: underline;
	}
	.recipe-meta {
		display: block;
		font-size: 0.8em;
		color: #777;
	}
	.actions {
		display: flex;
		gap: 0.35em;
		flex-shrink: 0;
	}
	@media (max-width: 500px) {
		.toolbar-actions {
			width: 100%;
		}
		.toolbar-actions .button {
			flex: 1;
			justify-content: center;
		}
	}
</style>
