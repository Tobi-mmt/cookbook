<script lang="ts">
	import { resolve } from '$app/paths';
	import { REPORT_TARGET_LABELS, reasonLabel, type ReportTarget } from '#lib/reportReasons.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			showClosed: boolean;
			cases: {
				id: number;
				targetType: ReportTarget;
				status: string;
				title: string;
				reports: number;
				reasons: string[] | null;
				appealOf: number | null;
				decision: string | null;
				createdAt: Date;
			}[];
		};
	} = $props();

	const STATUS: Record<string, string> = {
		open: 'Offen',
		in_review: 'In Prüfung',
		done: 'Erledigt',
		rejected: 'Abgelehnt'
	};
</script>

<svelte:head>
	<title>Meldungen - {SITE_NAME}</title>
</svelte:head>

<h1>Meldungen</h1>
<p class="row">
	<a class="btn" href={resolve('/admin/meldungen')} aria-current={!data.showClosed}>Offen</a>
	<a class="btn" href="{resolve('/admin/meldungen')}?erledigt" aria-current={data.showClosed}
		>Erledigt</a
	>
</p>

<div class="table-scroll">
	<table class="table">
		<thead>
			<tr><th>Fall</th><th>Gründe</th><th>Meldungen</th><th>Status</th><th>Seit</th></tr>
		</thead>
		<tbody>
			{#each data.cases as item (item.id)}
				<tr>
					<td>
						<a href={resolve('/admin/meldungen/[id]', { id: String(item.id) })}>
							{item.appealOf ? 'Widerspruch: ' : ''}{REPORT_TARGET_LABELS[item.targetType]} „{item.title}“
						</a>
					</td>
					<td>{(item.reasons ?? []).map(reasonLabel).join(', ') || '–'}</td>
					<td>{item.reports}</td>
					<td>{STATUS[item.status]}</td>
					<td>{item.createdAt.toLocaleDateString('de-DE')}</td>
				</tr>
			{:else}
				<tr><td colspan="5">Keine Fälle.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
