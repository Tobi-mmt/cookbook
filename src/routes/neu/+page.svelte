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

	const VIDEO_SITES =
		/(^|\.)(instagram\.com|tiktok\.com|youtube\.com|youtu\.be|facebook\.com|pinterest\.[a-z.]+)$/;
	let mode = $state<'link' | 'ai'>('link');
	const videoLink = $derived.by(() => {
		try {
			return VIDEO_SITES.test(new URL(url.trim()).hostname) ? url.trim() : null;
		} catch {
			return null;
		}
	});
	$effect(() => {
		if (videoLink) mode = 'ai';
	});

	const importFromLink: SubmitFunction = ({ cancel }) => {
		if (videoLink) {
			cancel();
			mode = 'ai';
			return;
		}
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
		await navigator.clipboard.writeText(
			aiPrompt(data.categories) + (videoLink ? `\nLink: ${videoLink}\n` : '')
		);
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
			<button type="button" class="btn" onclick={reset}>Neu beginnen</button>
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
			<button type="button" class="btn" onclick={reset}>Anderen Link importieren</button>
		</div>
	{:else}
		<section class="takeover" aria-label="Rezept übernehmen">
			<div class="takeover-head">
				<span class="label">Rezept übernehmen</span>
				<div class="modes" role="tablist" aria-label="Woraus übernehmen">
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'link'}
						onclick={() => (mode = 'link')}><Link size="1em" aria-hidden="true" /> Link</button
					>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'ai'}
						onclick={() => (mode = 'ai')}
						><Sparkles size="1em" aria-hidden="true" /> Bild, Video oder Text</button
					>
				</div>
			</div>

			{#if mode === 'link'}
				<form
					method="POST"
					action={resolve('/import')}
					class="row link"
					use:enhance={importFromLink}
				>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						class="input"
						type="url"
						name="url"
						bind:value={url}
						placeholder="Link zum Rezept einfügen, z. B. von Chefkoch"
						aria-label="Link zum Rezept"
						required
						readonly={importing}
						autofocus={page.url.searchParams.has('link')}
					/>
					<input type="hidden" name="cookbookId" value={data.cookbookId} />
					<button type="submit" class="btn btn--primary" disabled={importing}>
						{importing ? 'Wird geladen …' : 'Übernehmen'}
					</button>
				</form>
				{#if imported?.duplicate}
					<div class="message">
						<p>
							Dieses Rezept ist schon im Kochbuch:
							<a href={recipePath(imported.duplicate)}>{imported.duplicate.title}</a>.
						</p>
						<button type="button" class="btn" onclick={() => (confirmedDuplicate = true)}
							>Trotzdem übernehmen</button
						>
					</div>
				{/if}
				{#if importError}<p class="message message--error" role="alert">{importError}</p>{/if}
			{:else}
				<div class="ai">
					<p class="hint">
						{#if videoLink}
							Videos und Beiträge aus sozialen Netzwerken liest die {SITE_NAME} nicht selbst aus.
						{/if}
						Eine eingebaute KI würde laufende Kosten verursachen, die ich als Betreiber nicht tragen kann.
						Mit einer kostenlosen KI deiner Wahl geht es trotzdem:
					</p>
					<ol>
						<li>
							<button type="button" class="btn" onclick={copyPrompt}
								>{promptCopied ? 'Anweisung kopiert' : 'Anweisung für die KI kopieren'}</button
							>
							{#if videoLink}<span class="hint">mit deinem Link</span>{/if}
						</li>
						<li>
							In
							<!-- eslint-disable svelte/no-navigation-without-resolve -- external links -->
							<a href="https://chat.mistral.ai" target="_blank" rel="noreferrer">Le Chat</a>
							(Frankreich),
							<a href="https://lumo.proton.me" target="_blank" rel="noreferrer">Lumo</a> (Schweiz),
							<a href="https://chatgpt.com" target="_blank" rel="noreferrer">ChatGPT</a> oder
							<a href="https://claude.ai" target="_blank" rel="noreferrer">Claude</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
							einfügen{videoLink ? '' : ', Screenshot, Link oder Text dazugeben'}.
						</li>
						<li>
							<div class="answer">
								<textarea
									class="input"
									rows="3"
									bind:value={aiAnswer}
									placeholder="Antwort der KI hier einfügen"
									aria-label="Antwort der KI"></textarea>
								<button
									type="button"
									class="btn btn--primary"
									disabled={!aiAnswer.trim()}
									onclick={takeAiAnswer}>Übernehmen</button
								>
							</div>
						</li>
					</ol>
					{#if aiError}<p class="message message--error" role="alert">{aiError}</p>{/if}
					<p class="hint small">Was du der KI gibst, geht an deren Anbieter, nicht an uns.</p>
				</div>
			{/if}
		</section>
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
	.takeover {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.75rem 1rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.takeover-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.modes {
		display: flex;
		gap: 0.25rem;
		padding: 0.2rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-pill);
	}
	.modes button {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.3rem 0.8rem;
		font: inherit;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.modes button[aria-selected='true'] {
		color: var(--color-text);
		background: var(--color-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}
	.link {
		flex-wrap: nowrap;
	}
	.link .input {
		flex: 1;
		min-width: 0;
	}
	.ai {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.ai .hint {
		margin: 0;
	}
	.ai .small {
		font-size: 0.8125rem;
	}
	.ai ol {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin: 0;
		padding-left: 1.25rem;
		line-height: 1.5;
	}
	.answer {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}
	.answer textarea {
		width: 100%;
	}
	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-weight: 700;
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
		.link {
			flex-wrap: wrap;
		}
		.link .btn {
			width: 100%;
		}
	}
</style>
