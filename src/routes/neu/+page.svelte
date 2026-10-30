<script lang="ts">
	import type { Category } from '#types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { enhance, type SubmitFunction } from '$app/forms';
	import Link from '@lucide/svelte/icons/link';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { aiPrompt, parseAiAnswer } from '#lib/aiImport.js';
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
		aiRecipe = null;
		url = '';
	};

	let aiAnswer = $state('');
	let aiError = $state<string | null>(null);
	let aiRecipe = $state<RecipeInput | null>(null);
	let promptCopied = $state(false);

	const copyPrompt = async () => {
		await navigator.clipboard.writeText(aiPrompt(data.categories));
		promptCopied = true;
		setTimeout(() => (promptCopied = false), 2500);
	};

	const takeAiAnswer = () => {
		const result = parseAiAnswer(aiAnswer, data.categories);
		if ('error' in result) {
			aiError = result.error;
			return;
		}
		aiError = null;
		aiAnswer = '';
		aiRecipe = result.input;
	};
</script>

<svelte:head>
	<title>Neues Rezept - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Neues Rezept</h1>

	{#if aiRecipe}
		<div class="message">
			<p>
				Übernommen aus der Antwort der KI. Bitte prüfe alles, die KI kann sich irren. Gespeichert
				wird es erst mit „Speichern“.
			</p>
			<button type="button" class="btn btn--quiet" onclick={reset}>Neu beginnen</button>
		</div>
	{:else if showImport && imported}
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
		<details class="import ai">
			<summary>
				<span class="label"
					><Sparkles size="1em" aria-hidden="true" /> Aus Screenshot, Video oder Text übernehmen</span
				>
			</summary>
			<p class="hint">
				Screenshots, Instagram-Videos oder Fließtext liest die {SITE_NAME} nicht selbst aus: Eine eingebaute
				KI würde bei vielen Nutzern laufende Kosten verursachen, die ich als Betreiber nicht tragen kann.
				Mit einer kostenlosen KI deiner Wahl klappt es trotzdem:
			</p>
			<ol>
				<li>
					<button type="button" class="btn" onclick={copyPrompt}
						>{promptCopied ? 'Auftrag kopiert' : 'Auftrag kopieren'}</button
					>
				</li>
				<li>
					Öffne eine KI, z. B.
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external links -->
					<a href="https://chat.mistral.ai" target="_blank" rel="noreferrer">Le Chat</a>,
					<a href="https://chatgpt.com" target="_blank" rel="noreferrer">ChatGPT</a> oder
					<a href="https://claude.ai" target="_blank" rel="noreferrer">Claude</a>,
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
					füge den Auftrag ein und hänge deinen Screenshot, Link oder Text an.
				</li>
				<li>
					<label class="field">
						Kopiere die Antwort der KI und füge sie hier ein:
						<textarea class="input" rows="5" bind:value={aiAnswer}></textarea>
					</label>
					<button
						type="button"
						class="btn btn--primary"
						disabled={!aiAnswer.trim()}
						onclick={takeAiAnswer}>Übernehmen</button
					>
				</li>
			</ol>
			{#if aiError}<p class="message message--error" role="alert">{aiError}</p>{/if}
			<p class="hint">
				Was du der KI gibst, geht an deren Anbieter, nicht an die {SITE_NAME}.
			</p>
		</details>
		<p class="divider">oder selbst eingeben</p>
	{/if}

	{#key aiRecipe ?? imported?.url}
		{#if aiRecipe}
			<RecipeEditor
				recipe={aiRecipe}
				image={null}
				categories={data.categories}
				cookbooks={data.cookbooks}
				cookbookId={data.cookbookId}
				cancelHref={data.cancelHref}
				draftKey="ai"
				result={form}
			/>
		{:else if showImport && imported}
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
	.ai {
		margin-top: 0.75rem;
	}
	.ai summary {
		cursor: pointer;
	}
	.ai ol {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0.5rem 0;
		padding-left: 1.25rem;
		line-height: 1.5;
	}
	.ai li .btn {
		margin-top: 0.4rem;
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
