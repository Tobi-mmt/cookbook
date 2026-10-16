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
			cookbooks: {
				id: string;
				name: string;
				owner: string | null;
				hidden: boolean;
				deleted: boolean;
				recipes: number;
			}[];
		};
	} = $props();
</script>

<svelte:head>
	<title>Kochbücher - {SITE_NAME}</title>
</svelte:head>

<h1>Kochbücher</h1>
<form method="GET" class="row search">
	<input class="input" name="q" value={data.query} placeholder="Name oder Besitzer" />
	<button type="submit" class="btn">Suchen</button>
</form>
<div class="table-scroll">
	<table class="table">
		<thead><tr><th>Name</th><th>Besitzer</th><th>Rezepte</th><th>Status</th></tr></thead>
		<tbody>
			{#each data.cookbooks as cookbook (cookbook.id)}
				<tr>
					<td
						><a href={resolve('/admin/kochbuecher/[id]', { id: cookbook.id })}>{cookbook.name}</a
						></td
					>
					<td>@{cookbook.owner}</td>
					<td>{cookbook.recipes}</td>
					<td>{cookbook.deleted ? 'gelöscht' : cookbook.hidden ? 'ausgeblendet' : ''}</td>
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
		max-width: 24rem;
	}
</style>
