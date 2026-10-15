<script lang="ts">
	// TEMPORARY: see src/lib/server/pruneWebp.ts
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { PruningResult, UnusedFile } from '#lib/server/pruneWebp.js';

	type Plan = {
		recipesWithImage: number;
		changes: { id: string; title: string; removed: number }[];
		unusedFiles: UnusedFile[];
		missingFiles: string[];
	};

	let { data, form }: { data: { plan: Plan | null }; form: { result: PruningResult } | null } =
		$props();

	let running = $state(false);
	let requestError = $state<string | null>(null);

	const plan = $derived(data.plan);
	const removedVariants = $derived(plan?.changes.reduce((sum, { removed }) => sum + removed, 0));
	const unusedBytes = $derived(plan?.unusedFiles.reduce((sum, { size }) => sum + size, 0) ?? 0);
	const nothingToDo = $derived(plan && !plan.changes.length && !plan.unusedFiles.length);

	const megabytes = (bytes: number) =>
		`${(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;

	const submit: SubmitFunction = ({ cancel }) => {
		if (!confirm('Alte WebP-Varianten und nicht mehr verwendete Dateien endgültig löschen?')) {
			cancel();
			return;
		}
		running = true;
		requestError = null;
		return async ({ result, update }) => {
			if (result.type === 'error') {
				console.error(result.error);
				requestError =
					'Das Bereinigen ist fehlgeschlagen oder hat zu lange gedauert. Es kann gefahrlos erneut gestartet werden.';
			}
			await update();
			running = false;
		};
	};
</script>

<svelte:head>
	<title>Bilder bereinigen - Unser Kochbuch</title>
</svelte:head>

<h1>Bilder bereinigen</h1>
<p class="hint">
	Neue Bilder werden als AVIF in allen Größen und nur einem WebP gespeichert. Ältere Bilder haben
	noch WebP in allen Größen. Hier werden diese überflüssigen Varianten aus der Datenbank entfernt,
	alle Seiten neu erzeugt und danach alle Dateien gelöscht, die kein Rezept mehr verwendet. Diese
	Seite ist nur vorübergehend da.
</p>

{#if form?.result}
	{#if form.result.ok}
		<p class="notice" role="status">
			Fertig: {form.result.updatedRecipes} Rezepte angepasst, {form.result.deletedFiles} Dateien gelöscht
			({megabytes(form.result.deletedBytes)}).
		</p>
	{:else}
		<div class="warning" role="alert">
			<p>{form.result.error}</p>
			{#if form.result.failedPaths?.length}
				<ul>
					{#each form.result.failedPaths as path (path)}<li><code>{path}</code></li>{/each}
				</ul>
			{/if}
			<p>Das Bereinigen kann gefahrlos erneut gestartet werden.</p>
		</div>
	{/if}
{/if}
{#if requestError}
	<p class="warning" role="alert">{requestError}</p>
{/if}

{#if !plan}
	<p class="warning">Nur in Production und Preview möglich, lokal gibt es kein Vercel Blob.</p>
{:else}
	<h2>Vorschau</h2>
	<ul class="summary">
		<li>{plan.recipesWithImage} Rezepte mit Bild</li>
		<li>{plan.changes.length} davon mit alten WebP-Varianten ({removedVariants} Varianten)</li>
		<li>
			{plan.unusedFiles.length} nicht mehr verwendete Dateien ({megabytes(unusedBytes)}), inklusive
			der alten WebP-Varianten
		</li>
	</ul>

	{#if plan.missingFiles.length}
		<div class="warning">
			<p>
				{plan.missingFiles.length} verlinkte Dateien fehlen im Speicher. Zur Sicherheit wird nichts gelöscht,
				solange das so ist.
			</p>
			<ul>
				{#each plan.missingFiles as pathname (pathname)}<li><code>{pathname}</code></li>{/each}
			</ul>
		</div>
	{/if}

	{#if plan.unusedFiles.length}
		<details>
			<summary>Dateien, die gelöscht werden</summary>
			<ul class="files">
				{#each plan.unusedFiles as file (file.pathname)}
					<li><code>{file.pathname}</code> {megabytes(file.size)}</li>
				{/each}
			</ul>
		</details>
	{/if}

	{#if nothingToDo}
		<p class="notice">Es gibt nichts mehr zu bereinigen.</p>
	{:else}
		<form method="POST" use:enhance={submit}>
			<button type="submit" class="button button--danger" disabled={running}>
				{running ? 'Bereinigt…' : 'Jetzt bereinigen'}
			</button>
		</form>
		{#if running}
			<p class="hint" role="status">Das kann bis zu einer Minute dauern.</p>
		{/if}
	{/if}
{/if}

<style>
	h1,
	h2 {
		font-weight: 200;
	}
	.hint {
		color: #777;
	}
	.summary {
		line-height: 1.8;
	}
	details {
		margin: 1em 0 1.5em;
	}
	.files {
		font-size: 0.85em;
		max-height: 20em;
		overflow: auto;
	}
	.warning ul {
		font-size: 0.85em;
	}
</style>
