<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '#lib/site.js';
	import Pagination from '#components/Pagination.svelte';
	import type { Pagination as PaginationData } from '#lib/server/pagination.js';

	let {
		data
	}: {
		data: {
			pagination: PaginationData;
			query: string;
			person: string;
			cookbook: string;
			recipes: {
				id: string;
				title: string;
				cookbook: string;
				owner: string | null;
				author: string | null;
				hidden: boolean;
				deleted: boolean;
			}[];
		};
	} = $props();
</script>

<svelte:head>
	<title>Rezepte - {SITE_NAME}</title>
</svelte:head>

<h1>Rezepte</h1>
<form method="GET" class="row search">
	<input class="input" name="q" value={data.query} placeholder="Titel oder Zutat" />
	<input class="input" name="kochbuch" value={data.cookbook} placeholder="Kochbuch" />
	<input class="input" name="person" value={data.person} placeholder="@person" />
	<button type="submit" class="btn">Suchen</button>
</form>
<div class="table-scroll">
	<table class="table">
		<thead><tr><th>Titel</th><th>Kochbuch</th><th>Von</th><th>Status</th></tr></thead>
		<tbody>
			{#each data.recipes as recipe (recipe.id)}
				<tr>
					<td><a href={resolve('/admin/rezepte/[id]', { id: recipe.id })}>{recipe.title}</a></td>
					<td>{recipe.cookbook} (@{recipe.owner})</td>
					<td>{recipe.author ? `@${recipe.author}` : '–'}</td>
					<td>{recipe.deleted ? 'gelöscht' : recipe.hidden ? 'ausgeblendet' : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<Pagination pagination={data.pagination} />

<style>
	.search {
		margin-bottom: 1rem;
	}
	.search .input {
		flex: 1;
		min-width: 10rem;
	}
</style>
