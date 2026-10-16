<script lang="ts">
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			entries: {
				id: number;
				admin: string | null;
				action: string;
				targetType: string;
				targetId: string;
				before: unknown;
				after: unknown;
				note: string | null;
				createdAt: Date;
			}[];
			admins: { id: string; name: string }[];
			filter: { admin: string; target: string; from: string; to: string };
		};
	} = $props();

	const TARGETS = ['user', 'cookbook', 'recipe', 'image', 'category'];
	const format = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(date);
</script>

<svelte:head>
	<title>Audit-Log - {SITE_NAME}</title>
</svelte:head>

<h1>Audit-Log</h1>
<form method="GET" class="row filter">
	<select class="input" name="admin" value={data.filter.admin} aria-label="Admin">
		<option value="">Alle Admins</option>
		{#each data.admins as admin (admin.id)}<option value={admin.id}>{admin.name}</option>{/each}
	</select>
	<select class="input" name="objekt" value={data.filter.target} aria-label="Objekt">
		<option value="">Alle Objekte</option>
		{#each TARGETS as target (target)}<option value={target}>{target}</option>{/each}
	</select>
	<input class="input" type="date" name="von" value={data.filter.from} aria-label="Von" />
	<input class="input" type="date" name="bis" value={data.filter.to} aria-label="Bis" />
	<button type="submit" class="btn">Filtern</button>
</form>

<div class="table-scroll">
	<table class="table">
		<thead><tr><th>Wann</th><th>Wer</th><th>Was</th><th>Objekt</th><th>Details</th></tr></thead>
		<tbody>
			{#each data.entries as entry (entry.id)}
				<tr>
					<td>{format(entry.createdAt)}</td>
					<td>{entry.admin ?? '–'}</td>
					<td>
						{entry.action}
						{#if entry.note}<br /><span class="hint">{entry.note}</span>{/if}
					</td>
					<td>{entry.targetType} {entry.targetId}</td>
					<td>
						<details>
							<summary>vorher / nachher</summary>
							<pre>{JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}</pre>
						</details>
					</td>
				</tr>
			{:else}
				<tr><td colspan="5">Keine Einträge.</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.filter {
		margin-bottom: 1rem;
	}
	pre {
		max-width: 30rem;
		max-height: 16rem;
		overflow: auto;
		font-size: 0.75rem;
	}
</style>
