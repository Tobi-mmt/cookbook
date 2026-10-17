<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BreakdownStats } from '#lib/server/tracking.js';
	import { SITE_NAME } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const visitors = $derived(data.days.reduce((sum, day) => sum + day.visitors, 0));
	const pageViews = $derived(data.days.reduce((sum, day) => sum + day.pageViews, 0));
	const maxVisitors = $derived(Math.max(1, ...data.days.map((day) => day.visitors)));

	const dateFormat = new Intl.DateTimeFormat('de-DE', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		timeZone: 'UTC'
	});
	const percentFormat = new Intl.NumberFormat('de-DE', { style: 'percent' });

	const formatDay = (day: string) => dateFormat.format(new Date(`${day}T00:00:00Z`));
</script>

<svelte:head>
	<title>Statistik - {SITE_NAME}</title>
</svelte:head>

<h1>Statistik</h1>

<form class="range" method="GET">
	{#each data.ranges as range (range.days)}
		<a
			class="btn"
			class:button--primary={range.from === data.from && range.to === data.to}
			href="{resolve('/admin/stats')}?from={range.from}&to={range.to}">{range.days} Tage</a
		>
	{/each}
	<label>Von <input class="input" type="date" name="from" value={data.from} /></label>
	<label>Bis <input class="input" type="date" name="to" value={data.to} /></label>
	<button type="submit" class="btn">Anzeigen</button>
</form>

<div class="totals">
	<div>
		<span class="value">{visitors}</span>
		<span class="label">Besucher</span>
	</div>
	<div>
		<span class="value">{pageViews}</span>
		<span class="label">Seitenaufrufe</span>
	</div>
	<div>
		<span class="value">{Math.round(visitors / data.days.length)}</span>
		<span class="label">Besucher pro Tag</span>
	</div>
</div>

<h2>Besucher pro Tag</h2>
<div class="chart" role="img" aria-label="Besucher pro Tag, Details in der Tabelle unten">
	{#each data.days as day (day.day)}
		<div
			class="bar"
			style="height: {(day.visitors / maxVisitors) * 100}%"
			title="{formatDay(day.day)}: {day.visitors} Besucher, {day.pageViews} Seitenaufrufe"
		></div>
	{/each}
</div>

<h2>Seiten</h2>
{#if data.pages.length === 0}
	<p>In diesem Zeitraum gab es keine Besucher.</p>
{:else}
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					<th>Seite</th>
					<th class="number">Besucher</th>
					<th class="number">Aufrufe</th>
				</tr>
			</thead>
			<tbody>
				{#each data.pages as page (page.path)}
					<tr>
						<td>
							<a href={page.path} target="_blank" rel="noreferrer">{page.title ?? page.path}</a>
							{#if page.title}<span class="path">{page.path}</span>{/if}
						</td>
						<td class="number">{page.visitors}</td>
						<td class="number">{page.pageViews}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#snippet breakdown(title: string, rows: BreakdownStats[], total: number)}
	<section>
		<h2>{title}</h2>
		<div class="table-scroll">
			<table>
				<thead>
					<tr>
						<th>{title}</th>
						<th class="number">Besucher</th>
						<th class="number">Aufrufe</th>
						<th class="number">Anteil</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.value)}
						{@const share = total ? row.pageViews / total : 0}
						<tr>
							<td>{row.value ?? 'Unbekannt'}</td>
							<td class="number">{row.visitors}</td>
							<td class="number">{row.pageViews}</td>
							<td class="number share" style="--share: {share * 100}%">
								{percentFormat.format(share)}
							</td>
						</tr>
					{:else}
						<tr><td colspan="4">Keine Daten</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/snippet}

{@render breakdown(
	'Herkunft',
	data.referrers,
	data.referrers.reduce((sum, row) => sum + row.pageViews, 0)
)}

<div class="systems">
	{@render breakdown('Browser', data.browsers, pageViews)}
	{@render breakdown('Betriebssystem', data.operatingSystems, pageViews)}
</div>

<details>
	<summary>Alle Tage</summary>
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					<th>Tag</th>
					<th class="number">Besucher</th>
					<th class="number">Aufrufe</th>
				</tr>
			</thead>
			<tbody>
				{#each [...data.days].reverse() as day (day.day)}
					<tr>
						<td>{formatDay(day.day)}</td>
						<td class="number">{day.visitors}</td>
						<td class="number">{day.pageViews}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</details>

<p class="hint">
	Besucher werden ohne Cookies und ohne gespeicherte IP-Adresse gezählt und sind nur innerhalb eines
	Tages eindeutig. Wer an mehreren Tagen kommt, zählt im Zeitraum mehrfach. Bots werden nicht
	gezählt.
</p>

<style>
	h1,
	h2 {
		font-weight: 200;
	}
	.range {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em;
	}
	.range label {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}
	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		margin: 1.5em 0;
	}
	.totals > div {
		flex: 1 1 10em;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.75em 1em;
		display: flex;
		flex-direction: column;
	}
	.value {
		font-size: 2em;
		font-weight: 700;
	}
	.label {
		color: #666;
	}
	.chart {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 10em;
		border-bottom: 1px solid #bbb;
	}
	.bar {
		flex: 1;
		min-height: 1px;
		background: #8882a8;
		border-radius: 2px 2px 0 0;
	}
	.bar:hover {
		background: #27343a;
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
	td a {
		color: inherit;
	}
	.number {
		text-align: right;
	}
	.path {
		display: block;
		font-size: 0.8em;
		color: #888;
		word-break: break-all;
	}
	.systems {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
		gap: 0 2em;
	}
	.share {
		background: linear-gradient(to left, #e7e5ef var(--share), transparent var(--share));
	}
	details {
		margin-top: 2em;
	}
	summary {
		cursor: pointer;
	}
	.hint {
		margin-top: 2em;
		font-size: 0.85em;
		color: #666;
	}
</style>
