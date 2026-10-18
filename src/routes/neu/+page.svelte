<script lang="ts">
	import type { Category } from '#types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { enhance, type SubmitFunction } from '$app/forms';
	import Link from '@lucide/svelte/icons/link';
	import RecipeEditor from '#components/editor/RecipeEditor.svelte';
	import { recipePath } from '#lib/paths.js';
	import type { RecipeInput } from '#lib/recipeInput.js';
	import type { ImportResult } from '#lib/server/recipeActions.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			recipe: RecipeInput;
			categories: Category[];
			cookbookId: string;
			cancelHref: string;
			cookbooks: { id: string; name: string }[];
		};
		form: { error?: string } | null;
	} = $props();

	let url = $state('');
	let importing = $state(false);
	let importError = $state<string | null>(null);
	let imported = $state<ImportResult | null>(null);
	let confirmedDuplicate = $state(false);

	const showImport = $derived(Boolean(imported && (!imported.duplicate || confirmedDuplicate)));

	const importFromLink: SubmitFunction = () => {
		importing = true;
		importError = null;
		confirmedDuplicate = false;
		return async ({ result }) => {
			importing = false;
			if (result.type === 'success') {
				imported = (result.data as { imported: ImportResult }).imported;
			} else if (result.type === 'failure') {
				importError = (result.data as { error?: string } | undefined)?.error ?? null;
			} else {
				importError = 'Das Rezept konnte nicht geladen werden. Versuche es noch einmal.';
			}
		};
	};

	const reset = () => {
		imported = null;
		url = '';
	};
</script>

<svelte:head>
	<title>Neues Rezept - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Neues Rezept</h1>

	{#if showImport && imported}
		<div class="message">
			<p>
				Übernommen von <a href={imported.url} target="_blank" rel="noreferrer"
					>{new URL(imported.url).hostname.replace(/^www\./, '')}</a
				>. Bitte prüfe das Rezept und formuliere die Schritte in eigenen Worten. Gespeichert wird es
				erst mit „Speichern“.
				{#if imported.imageSkipped}
					Das Bild der Originalseite wurde nicht übernommen, weil es urheberrechtlich geschützt ist.
				{/if}
			</p>
			<button type="button" class="btn btn--quiet" onclick={reset}>Anderen Link importieren</button>
		</div>
	{:else}
		<form method="POST" action={resolve('/import')} class="import" use:enhance={importFromLink}>
			<label class="field">
				<span class="label"
					><Link size="1em" aria-hidden="true" /> Rezept aus einem Link übernehmen</span
				>
				<span class="row">
					<!-- svelte-ignore a11y_autofocus -->
					<input
						class="input"
						type="url"
						name="url"
						bind:value={url}
						placeholder="https://www.chefkoch.de/rezepte/…"
						required
						readonly={importing}
						autofocus={page.url.searchParams.has('link')}
					/>
					<button type="submit" class="btn btn--primary" disabled={importing}>
						{importing ? 'Wird geladen …' : 'Importieren'}
					</button>
				</span>
			</label>
			<input type="hidden" name="cookbookId" value={data.cookbookId} />
			<p class="hint">
				Zutaten und Schritte werden übernommen, z. B. von Chefkoch oder lecker.de. Du prüfst alles,
				bevor es gespeichert wird.
			</p>
			{#if imported?.duplicate}
				<div class="message">
					<p>
						Dieses Rezept ist schon im Kochbuch:
						<a href={recipePath(imported.duplicate)}>{imported.duplicate.title}</a>.
					</p>
					<button type="button" class="btn" onclick={() => (confirmedDuplicate = true)}
						>Trotzdem importieren</button
					>
				</div>
			{/if}
			{#if importError}<p class="message message--error" role="alert">{importError}</p>{/if}
		</form>
		<p class="divider">oder selbst eingeben</p>
	{/if}

	{#key imported?.url}
		{#if showImport && imported}
			<RecipeEditor
				recipe={imported.input}
				image={null}
				categories={data.categories}
				cookbooks={data.cookbooks}
				cookbookId={data.cookbookId}
				cancelHref={data.cancelHref}
				draftKey="import:{imported.url}"
				importedImage={imported.image && { ...imported.image, sourceUrl: imported.url }}
				imported
				result={form}
			/>
		{:else}
			<RecipeEditor
				recipe={data.recipe}
				image={null}
				categories={data.categories}
				cookbooks={data.cookbooks}
				cookbookId={data.cookbookId}
				cancelHref={data.cancelHref}
				draftKey={page.url.searchParams.get('entwurf') ?? 'new'}
				result={form}
			/>
		{/if}
	{/key}
</div>

<style>
	.import {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-weight: 700;
	}
	.import .row {
		flex-wrap: nowrap;
	}
	.import .input {
		flex: 1;
		min-width: 0;
	}
	.import .hint,
	.message p {
		margin: 0;
	}
	.message {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		margin: 0 0 1rem;
	}
	.divider {
		margin: 1.25rem 0 1.5rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-text-subtle);
	}
	a {
		color: inherit;
	}
	@media (max-width: 599px) {
		.import .row {
			flex-wrap: wrap;
		}
		.import .row .btn {
			width: 100%;
		}
	}
</style>
