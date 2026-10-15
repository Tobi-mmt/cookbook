<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			openCases: number;
			newPeople: number;
			newRecipes: number;
			mailsThisMonth: number;
			databaseBytes: number;
			latestPeople: { id: string; name: string; username: string | null; createdAt: Date }[];
		};
	} = $props();

	const DATABASE_LIMIT = 1024 * 1024 * 1024;
	const share = $derived(data.databaseBytes / DATABASE_LIMIT);
</script>

<svelte:head>
	<title>Verwaltung - {SITE_NAME}</title>
</svelte:head>

<h1>Übersicht</h1>
<div class="cards">
	<a class="card" href={resolve('/admin/meldungen')}
		><strong>{data.openCases}</strong> offene Fälle</a
	>
	<div class="card"><strong>{data.newPeople}</strong> neue Personen in 7 Tagen</div>
	<div class="card"><strong>{data.newRecipes}</strong> neue Rezepte in 7 Tagen</div>
	<div class="card">
		<strong>{data.mailsThisMonth}</strong> Mails in diesem Monat
		{#if data.mailsThisMonth > 300}<span class="hint">mehr als die 300 kostenlosen</span>{/if}
	</div>
	<div class="card">
		<strong>{(data.databaseBytes / 1024 / 1024).toFixed(1)} MB</strong> Datenbank von 1 GB
		{#if share >= 0.8}<span class="hint">Bald voll, Bezahlplan prüfen.</span>{/if}
	</div>
</div>

<h2>Neue Personen</h2>
<table class="table">
	<tbody>
		{#each data.latestPeople as person (person.id)}
			<tr>
				<td><a href={resolve('/admin/personen/[id]', { id: person.id })}>{person.name}</a></td>
				<td>{person.username ? `@${person.username}` : '–'}</td>
				<td>{person.createdAt.toLocaleDateString('de-DE')}</td>
			</tr>
		{/each}
	</tbody>
</table>
<p><a class="btn" href={resolve('/admin/stats')}>Aufrufstatistik</a></p>

<style>
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.card {
		color: inherit;
		text-decoration: none;
	}
	.hint {
		display: block;
	}
</style>
