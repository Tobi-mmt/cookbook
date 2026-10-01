<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RecipeIndexEntry } from '$types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { categoryColors } from '$lib/colors';
	import { slugerize } from '$lib/slugerize';

	let { data, form }: { data: { recipes: RecipeIndexEntry[] }; form: { error?: string } | null } =
		$props();

	let confirmDelete = $state<string | null>(null);

	const saved = $derived(data.recipes.find(({ id }) => id === $page.url.searchParams.get('saved')));
	const deleted = $derived($page.url.searchParams.has('deleted'));
	const revalidateFailed = $derived($page.url.searchParams.has('revalidateFailed'));
</script>

<svelte:head>
	<title>Rezepte verwalten - Unser Kochbuch</title>
</svelte:head>

<div class="toolbar">
	<h1>Rezepte ({data.recipes.length})</h1>
	<a href={resolve('/admin/recipes/new', {})} class="button button--primary">Neues Rezept</a>
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

<table>
	<thead>
		<tr>
			<th>Titel</th>
			<th>Kategorie</th>
			<th>Ernährung</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.recipes as recipe (recipe.id)}
			<tr>
				<td><a href={resolve('/admin/recipes/[id]', { id: recipe.id })}>{recipe.title}</a></td>
				<td>
					<span class="category" style="--color: {categoryColors[recipe.meta.category]}"
						>{recipe.meta.category}</span
					>
				</td>
				<td>{recipe.meta.nutritionType}</td>
				<td class="actions">
					<a
						class="button"
						href={resolve('/recipe/[recipeId]/[recipeTitle]', {
							recipeId: recipe.id,
							recipeTitle: slugerize(recipe.title)
						})}
						target="_blank"
						rel="noreferrer">Ansehen</a
					>
					<a class="button" href={resolve('/admin/recipes/[id]', { id: recipe.id })}>Bearbeiten</a>
					{#if confirmDelete === recipe.id}
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={recipe.id} />
							<button type="submit" class="button button--danger">Wirklich löschen</button>
						</form>
						<button type="button" class="button" onclick={() => (confirmDelete = null)}
							>Abbrechen</button
						>
					{:else}
						<button
							type="button"
							class="button button--danger"
							onclick={() => (confirmDelete = recipe.id)}>Löschen</button
						>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}
	h1 {
		font-weight: 200;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1em;
	}
	th {
		text-align: left;
		font-weight: 500;
		border-bottom: 2px solid #ddd;
	}
	th,
	td {
		padding: 0.5em;
	}
	tr + tr td {
		border-top: 1px solid #eee;
	}
	td a:not(.button) {
		color: inherit;
	}
	.category {
		border-left: 4px solid var(--color);
		padding-left: 0.5em;
	}
	.actions {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
	@media (max-width: 700px) {
		thead,
		td:nth-child(2),
		td:nth-child(3) {
			display: none;
		}
		tr {
			display: flex;
			flex-direction: column;
		}
		.actions {
			justify-content: flex-start;
		}
	}
</style>
