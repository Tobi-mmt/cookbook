<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { REPORT_TARGET_LABELS, reasonLabel, type ReportTarget } from '#lib/reportReasons.js';
	import { recipePath } from '#lib/paths.js';
	import { SITE_NAME } from '#lib/site.js';

	type Case = {
		id: number;
		targetType: ReportTarget;
		targetId: string;
		status: string;
		snapshot: unknown;
		appealOf: number | null;
		decision: string | null;
		decisionReason: string | null;
	};

	let {
		data,
		form
	}: {
		data: {
			case: Case;
			reports: {
				id: number;
				reason: string;
				comment: string | null;
				originalUrl: string | null;
				isRightsHolder: boolean | null;
				email: string | null;
				createdAt: Date;
				reporterId: string | null;
				reporterName: string | null;
				reporterUsername: string | null;
				unreliable: boolean | null;
			}[];
			current: Record<string, unknown> | null;
			affected: { id: string; name: string }[];
			history: { version: number; createdAt: Date; author: string | null }[];
			previous: Case[];
			copies: { id: string; title: string }[];
			original: Case | null;
			appeal: { reason: string; createdAt: Date } | null | undefined;
			self: { involved: boolean; blocked: boolean };
			decisions: Record<string, string>;
		};
		form: { saved?: string; error?: string } | null;
	} = $props();

	const item = $derived(data.case);
	const title = $derived(
		(item.snapshot as { title?: string } | null)?.title ?? (data.current?.title as string) ?? ''
	);
	const options = $derived(
		Object.entries(data.decisions).filter(([decision]) => {
			if (decision === 'remove_image') return item.targetType === 'image';
			if (decision === 'rename') return item.targetType === 'cookbook';
			if (['reset_username', 'warn', 'ban'].includes(decision)) return item.targetType === 'user';
			if (['hide', 'delete'].includes(decision))
				return ['recipe', 'cookbook'].includes(item.targetType);
			return true;
		})
	);
	let decision = $state('');
	const closed = $derived(['done', 'rejected'].includes(item.status));
	const format = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
</script>

<svelte:head>
	<title>Fall {item.id} - {SITE_NAME}</title>
</svelte:head>

<p><a href={resolve('/admin/meldungen')}>← Meldungen</a></p>
<h1>
	{item.appealOf ? 'Widerspruch: ' : ''}{REPORT_TARGET_LABELS[item.targetType]} „{title}“
</h1>

{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
{#if data.self.involved}
	<p class="message message--error">
		{data.self.blocked
			? 'Dieser Fall betrifft deine eigenen Inhalte, ein anderer Admin entscheidet.'
			: 'Dieser Fall betrifft deine eigenen Inhalte. Weil du der einzige Admin bist, wird deine Entscheidung im Audit-Log markiert.'}
	</p>
{/if}

<section>
	<h2>Inhalt</h2>
	{#if !data.current}
		<p>Der Inhalt ist nicht mehr vorhanden.</p>
	{:else if item.targetType === 'recipe' || item.targetType === 'image'}
		<p>
			<a href={recipePath({ id: item.targetId, title })} target="_blank">Rezept ansehen</a>
			·
			<a
				href={resolve('/rezept/[id]/[titel]/verlauf', { id: item.targetId, titel: 'x' })}
				target="_blank">Verlauf</a
			>
			{#if data.current.hiddenReason}· ausgeblendet: {data.current.hiddenReason}{/if}
		</p>
	{:else if item.targetType === 'cookbook'}
		<p>Kochbuch „{data.current.title}“</p>
	{:else}
		<p>
			{#if data.current.username}<a href="/@{data.current.username}" target="_blank"
					>@{data.current.username}</a
				>{/if}
			{data.current.banned ? '(gesperrt)' : ''}
			· <a href={resolve('/admin/personen/[id]', { id: item.targetId })}>In der Verwaltung</a>
		</p>
	{/if}
	<details>
		<summary>Stand bei der ersten Meldung</summary>
		<pre>{JSON.stringify(item.snapshot, null, 2)}</pre>
	</details>
	{#if data.affected.length}
		<p class="hint">Betroffen: {data.affected.map(({ name }) => name).join(', ')}</p>
	{/if}
	{#if data.copies.length > 1}
		<p class="hint">
			Dasselbe Bild in {data.copies.length} Rezepten: {data.copies
				.map(({ title }) => title)
				.join(', ')}
		</p>
	{/if}
</section>

{#if data.appeal}
	<section>
		<h2>Widerspruch</h2>
		<p>{data.appeal.reason}</p>
		<p class="hint">
			Ursprüngliche Entscheidung: {data.original?.decision} – {data.original?.decisionReason}
		</p>
	</section>
{/if}

<section>
	<h2>Meldungen ({data.reports.length})</h2>
	<table class="table">
		<tbody>
			{#each data.reports as report (report.id)}
				<tr>
					<td>
						<strong>{reasonLabel(report.reason)}</strong>
						{#if report.comment}<br />{report.comment}{/if}
						{#if report.originalUrl}<br />Original:
							<a href={report.originalUrl} rel="noreferrer" target="_blank">{report.originalUrl}</a>
							({report.isRightsHolder ? 'Rechteinhaber' : 'im Auftrag'}){/if}
					</td>
					<td>
						{report.reporterName ?? report.email ?? 'Gast'}
						{#if report.unreliable}<span class="hint">(unzuverlässig)</span>{/if}
						{#if report.reporterId && !report.unreliable}
							<form method="POST" action="?/unreliable" use:enhance>
								<input type="hidden" name="userId" value={report.reporterId} />
								<button type="submit" class="btn btn--quiet">als unzuverlässig markieren</button>
							</form>
						{/if}
					</td>
					<td>{format(report.createdAt)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

{#if data.history.length}
	<section>
		<h2>Bearbeitungen</h2>
		<ul>
			{#each data.history.slice(0, 5) as version (version.version)}
				<li>{format(version.createdAt)} – {version.author ?? 'ehemalige Person'}</li>
			{/each}
		</ul>
	</section>
{/if}

{#if data.previous.length}
	<section>
		<h2>Frühere Fälle</h2>
		<ul>
			{#each data.previous as previous (previous.id)}
				<li>
					<a href={resolve('/admin/meldungen/[id]', { id: String(previous.id) })}
						>Fall {previous.id}</a
					>:
					{previous.decision ?? previous.status}
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if !closed && !data.self.blocked}
	<section>
		<h2>Entscheidung</h2>
		{#if item.status === 'open'}
			<form method="POST" action="?/review" use:enhance>
				<button type="submit" class="btn">Prüfung übernehmen</button>
			</form>
		{/if}
		{#if item.appealOf}
			<form method="POST" class="stack" use:enhance>
				<label class="field">
					Begründung, geht an die Person
					<textarea class="input" name="reason" required></textarea>
				</label>
				<div class="row">
					<button type="submit" class="btn" formaction="?/uphold">Maßnahme bestätigen</button>
					<button type="submit" class="btn btn--primary" formaction="?/revert"
						>Maßnahme aufheben</button
					>
				</div>
			</form>
		{:else}
			<form method="POST" action="?/decide" class="stack" use:enhance>
				<fieldset class="stack">
					{#each options as [value, label] (value)}
						<label class="checkbox">
							<input type="radio" name="decision" {value} bind:group={decision} required />
							{label}
						</label>
					{/each}
				</fieldset>
				{#if decision === 'remove_image' && data.copies.length > 1}
					<label class="checkbox">
						<input type="checkbox" name="includeCopies" checked /> In allen Kopien entfernen
					</label>
				{/if}
				{#if decision === 'rename'}
					<label class="field">Neuer Name <input class="input" name="newName" required /></label>
				{/if}
				<label class="field">
					Begründung, geht an die Betroffenen und die Meldenden
					<textarea class="input" name="reason" required></textarea>
				</label>
				<div class="row"><button type="submit" class="btn btn--primary">Entscheiden</button></div>
			</form>
		{/if}
	</section>
{:else if closed}
	<p class="message">Entschieden: {item.decision} – {item.decisionReason}</p>
{/if}

<style>
	section {
		margin-bottom: 2rem;
	}
	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	pre {
		max-height: 20rem;
		overflow: auto;
		font-size: 0.75rem;
		background: var(--color-surface-muted);
		padding: 0.75rem;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}
	a {
		color: var(--color-text);
	}
</style>
