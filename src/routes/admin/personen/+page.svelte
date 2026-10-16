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
			people: {
				id: string;
				name: string;
				username: string | null;
				email: string;
				role: string;
				banned: boolean | null;
				createdAt: Date;
			}[];
		};
	} = $props();
</script>

<svelte:head>
	<title>Personen - {SITE_NAME}</title>
</svelte:head>

<h1>Personen</h1>
<form method="GET" class="row search">
	<input class="input" name="q" value={data.query} placeholder="Name, Benutzername oder E-Mail" />
	<button type="submit" class="btn">Suchen</button>
</form>
<div class="table-scroll">
	<table class="table">
		<thead><tr><th>Name</th><th>Benutzername</th><th>E-Mail</th><th>Seit</th></tr></thead>
		<tbody>
			{#each data.people as person (person.id)}
				<tr>
					<td>
						<a href={resolve('/admin/personen/[id]', { id: person.id })}>{person.name}</a>
						{#if person.role === 'admin'}<span class="hint">Admin</span>{/if}
						{#if person.banned}<span class="hint">gesperrt</span>{/if}
					</td>
					<td>{person.username ? `@${person.username}` : '–'}</td>
					<td>{person.email}</td>
					<td>{person.createdAt.toLocaleDateString('de-DE')}</td>
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
