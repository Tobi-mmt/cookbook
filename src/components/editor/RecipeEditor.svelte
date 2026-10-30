<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Conflict } from '#lib/server/recipeActions.js';
	import Globe from '@lucide/svelte/icons/globe';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Upload from '@lucide/svelte/icons/upload';
	import { aiImagePrompt } from '#lib/aiImport.js';
	import {
		NUTRITION_TYPES,
		findUnusedIngredients,
		recipeInputSchema,
		type RecipeInput
	} from '#lib/recipeInput.js';
	import IngredientList from './IngredientList.svelte';
	import StepList from './StepList.svelte';
	import { resizeImage } from './resizeImage';

	let {
		recipe: initialRecipe,
		image,
		categories,
		cookbooks,
		cookbookId,
		action,
		cancelHref,
		imported = false,
		version,
		draftKey,
		historyHref,
		importedImage,
		result
	}: {
		recipe: RecipeInput;
		image: RecipeImage | null;
		categories: Category[];
		/** for new recipes: the cookbooks to choose from */
		cookbooks?: { id: string; name: string }[];
		cookbookId?: string;
		action?: string;
		cancelHref: string;
		imported?: boolean;
		/** the version the editor started from, to notice changes of others */
		version?: number;
		/** where the unsaved state is kept in the browser */
		draftKey: string;
		historyHref?: string;
		/** a freely licensed image of an imported page, taken over when saving */
		importedImage?: { url: string; license: string; author?: string; sourceUrl: string } | null;
		result?: { error?: string; conflict?: Conflict; deleted?: { by: string | null } } | null;
	} = $props();

	// the editor works on a copy, the page re-creates it via {#key} for another recipe
	// svelte-ignore state_referenced_locally
	let recipe = $state($state.snapshot(initialRecipe));
	// svelte-ignore state_referenced_locally
	let selectedCookbook = $state(cookbookId ?? cookbooks?.[0]?.id ?? '');
	let imageFile = $state<Blob | null>(null);
	let previewUrl = $state<string | null>(null);
	let imageError = $state<string | null>(null);
	// svelte-ignore state_referenced_locally
	let useImportedImage = $state(Boolean(importedImage));
	let saving = $state(false);
	let savingSeconds = $state(0);
	let uploadingImage = $state(false);
	let force = $state(false);
	let sessionExpired = $state(false);
	let rightsLost = $state(false);
	let draft = $state<{ recipe: RecipeInput; savedAt: number } | null>(null);
	let issues = $state<string[]>([]);
	// svelte-ignore state_referenced_locally
	let outcome = $state(result);
	let problems = $state<HTMLElement>();

	const DRAFT_PREFIX = 'kochbuch:draft:';

	const readDraft = () => {
		try {
			const stored = localStorage.getItem(DRAFT_PREFIX + draftKey);
			return stored ? (JSON.parse(stored) as { recipe: RecipeInput; savedAt: number }) : null;
		} catch {
			return null;
		}
	};
	const clearDraft = () => {
		try {
			localStorage.removeItem(DRAFT_PREFIX + draftKey);
		} catch {
			// private mode, nothing was stored
		}
		draft = null;
	};

	onMount(() => {
		const stored = readDraft();
		if (stored && JSON.stringify(stored.recipe) !== JSON.stringify(initialRecipe)) draft = stored;
	});

	// keeps the unsaved state, e.g. for conflicts, crashes or an expired session
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const snapshot = JSON.stringify(recipe);
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			if (snapshot === JSON.stringify(initialRecipe)) return;
			try {
				localStorage.setItem(
					DRAFT_PREFIX + draftKey,
					JSON.stringify({ recipe: JSON.parse(snapshot), savedAt: Date.now() })
				);
			} catch {
				// private mode or full storage, the editor still works
			}
		}, 500);
	});

	const timeAgo = (date: Date | number) => {
		const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
		if (minutes < 1) return 'gerade eben';
		if (minutes < 60) return `vor ${minutes} Minute${minutes === 1 ? '' : 'n'}`;
		return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(
			new Date(date)
		);
	};

	const currentPreview = $derived(
		previewUrl ?? image?.variants.webp.find(({ width }) => width >= 900)?.url ?? null
	);
	const unused = $derived(findUnusedIngredients(recipe));

	let imagePromptCopied = $state(false);
	let imagePromptHint = $state<string | null>(null);
	let imageFromAi = $state(false);

	const copyImagePrompt = async () => {
		if (!recipe.title.trim()) {
			imagePromptHint = 'Gib zuerst einen Titel ein, damit die KI weiß, was sie zeigen soll.';
			return;
		}
		await navigator.clipboard.writeText(aiImagePrompt(recipe));
		imagePromptCopied = true;
		imageFromAi = true;
		imagePromptHint =
			'In einer KI wie Le Chat oder ChatGPT einfügen, das Bild speichern und hier hochladen.';
		setTimeout(() => (imagePromptCopied = false), 2500);
	};

	const onImageChange = async (event: Event) => {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		imageError = null;
		if (!file) return;
		try {
			imageFile = await resizeImage(file);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			previewUrl = URL.createObjectURL(imageFile);
		} catch (resizeError) {
			console.error(resizeError);
			imageError = 'Das Bild konnte nicht gelesen werden.';
		}
	};

	const removeLinks = (clientId: string) => {
		for (const step of recipe.steps) {
			step.links = step.links.filter((link) => link.ingredientId !== clientId);
		}
	};

	$effect(() => {
		if (!saving) return;
		savingSeconds = 0;
		const timer = setInterval(() => savingSeconds++, 1000);
		return () => clearInterval(timer);
	});

	const savingText = $derived(
		savingSeconds >= 12
			? 'Das dauert gerade länger als sonst. Bitte lass die Seite offen, dein Stand ist gesichert.'
			: uploadingImage && savingSeconds < 4
				? 'Das Bild wird hochgeladen …'
				: 'Das Rezept wird gespeichert …'
	);

	const showProblems = async () => {
		await tick();
		problems?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	const submit: SubmitFunction = ({ formData, cancel }) => {
		const parsed = recipeInputSchema.safeParse($state.snapshot(recipe));
		issues = parsed.success ? [] : [...new Set(parsed.error.issues.map(({ message }) => message))];
		if (issues.length) {
			cancel();
			showProblems();
			return;
		}
		saving = true;
		uploadingImage = Boolean(imageFile || (importedImage && useImportedImage));
		outcome = null;
		sessionExpired = false;
		formData.set('recipe', JSON.stringify(recipe));
		formData.delete('image');
		if (imageFile) formData.set('image', imageFile, 'image.jpg');
		if (version) formData.set('baseVersion', String(version));
		if (force) formData.set('force', '1');
		return async ({ result: response, update }) => {
			saving = false;
			if (response.type === 'redirect' && response.location.startsWith('/anmelden')) {
				// keeps the editor open, the draft is saved and the save can be repeated
				sessionExpired = true;
				return;
			}
			if (response.type === 'error' && response.status === 403) {
				rightsLost = true;
				return;
			}
			if (response.type === 'failure') {
				outcome = response.data ?? null;
				showProblems();
				return;
			}
			if (response.type === 'error') {
				outcome = {
					error:
						'Das Speichern hat nicht geklappt. Dein Stand ist gesichert, versuche es gleich noch einmal.'
				};
				showProblems();
				return;
			}
			if (response.type === 'redirect') clearDraft();
			await update({ reset: false });
		};
	};
</script>

<form method="POST" {action} enctype="multipart/form-data" use:enhance={submit} class="editor">
	{#if cookbooks && cookbooks.length > 1}
		<label class="field">
			Kochbuch
			<select class="input" name="cookbookId" bind:value={selectedCookbook}>
				{#each cookbooks as cookbook (cookbook.id)}
					<option value={cookbook.id}>{cookbook.name}</option>
				{/each}
			</select>
		</label>
	{:else if cookbooks}
		<input type="hidden" name="cookbookId" value={selectedCookbook} />
	{/if}

	{#if draft}
		<div class="message">
			<p>Es gibt einen ungespeicherten Entwurf von {timeAgo(draft.savedAt)}.</p>
			<div class="row">
				<button
					type="button"
					class="btn"
					onclick={() => {
						recipe = $state.snapshot(draft!.recipe);
						draft = null;
					}}>Wiederherstellen</button
				>
				<button type="button" class="btn btn--quiet" onclick={clearDraft}>Verwerfen</button>
			</div>
		</div>
	{/if}

	<section class="section">
		<label class="field">Titel <input class="input" bind:value={recipe.title} required /></label>
		<label class="field">
			Beschreibung <span class="optional">(optional)</span>
			<textarea class="input" rows="3" bind:value={recipe.description}></textarea>
		</label>
		<label class="field">
			Quelle
			{#if !imported && !initialRecipe.sourceUrl}
				<span class="optional">(optional, Pflicht bei Rezepten von anderen Seiten)</span>
			{/if}
			<input
				class="input"
				type="url"
				bind:value={recipe.sourceUrl}
				readonly={imported}
				required={Boolean(initialRecipe.sourceUrl)}
			/>
			{#if imported}
				<span class="hint">Die Quelle wird beim Import festgehalten.</span>
			{:else if initialRecipe.sourceUrl}
				<span class="hint">Die Quelle lässt sich ändern, aber nicht entfernen.</span>
			{/if}
		</label>
		{#if imported && initialRecipe.sourceUrl}
			<input type="hidden" name="importedFrom" value={initialRecipe.sourceUrl} />
		{/if}
		<div class="grid">
			<label class="field">
				Portionen
				<input class="input" type="number" min="1" step="1" bind:value={recipe.portion} required />
			</label>
			<label class="field">
				Dauer (min)
				<input class="input" type="number" min="1" step="1" bind:value={recipe.duration} required />
			</label>
			<label class="field">
				Kategorie
				<select class="input" bind:value={recipe.categoryId}>
					{#each categories as category (category.id)}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</label>
			<label class="field">
				Ernährung
				<select class="input" bind:value={recipe.nutritionType}>
					{#each NUTRITION_TYPES as nutritionType (nutritionType)}
						<option value={nutritionType}>{nutritionType}</option>
					{/each}
				</select>
			</label>
		</div>
	</section>

	<section class="section">
		<h2>Bild</h2>
		<div class="image">
			{#if currentPreview}
				<img src={currentPreview} alt="Vorschau" />
			{:else if importedImage && useImportedImage}
				<div class="message">
					<p>
						Das Bild der Originalseite steht unter einer freien Lizenz und wird beim Speichern
						übernommen: {importedImage.author
							? `Foto: ${importedImage.author}, `
							: ''}{importedImage.license}.
					</p>
					<input type="hidden" name="importImageUrl" value={importedImage.url} />
					<input type="hidden" name="importImageLicense" value={importedImage.license} />
					<input type="hidden" name="importImageAuthor" value={importedImage.author ?? ''} />
					<input type="hidden" name="importSourceUrl" value={importedImage.sourceUrl} />
					<button type="button" class="btn btn--quiet" onclick={() => (useImportedImage = false)}
						>Nicht übernehmen</button
					>
				</div>
			{:else}
				<div class="image-empty">Noch kein Bild</div>
			{/if}
			<div class="image-actions">
				<label class="btn upload">
					<Upload size="1em" aria-hidden="true" />
					{currentPreview ? 'Bild ersetzen' : 'Bild hochladen'}
					<input
						type="file"
						name="image"
						accept="image/jpeg,image/png,image/webp"
						onchange={onImageChange}
					/>
				</label>
				<button type="button" class="btn" onclick={copyImagePrompt}>
					<Sparkles size="1em" aria-hidden="true" />
					{imagePromptCopied ? 'Anweisung kopiert' : 'Mit KI erzeugen'}
				</button>
			</div>
			{#if imagePromptHint}<p class="hint" role="status">{imagePromptHint}</p>{/if}
			{#if imageFile}
				<label class="checkbox">
					<input type="checkbox" name="imageRights" required />
					Ich darf dieses Bild verwenden.
				</label>
				<label class="checkbox">
					<input type="checkbox" name="imageAi" bind:checked={imageFromAi} />
					Das Bild ist KI-generiert.
				</label>
			{/if}
			{#if imageError}<p class="message message--error">{imageError}</p>{/if}
		</div>
	</section>

	<section class="section">
		<h2>Zutaten</h2>
		<p class="hint">Mengen beziehen sich auf {recipe.portion} Portionen.</p>
		<IngredientList bind:ingredients={recipe.ingredients} onremove={removeLinks} />
	</section>

	<section class="section">
		<h2>Zubereitung</h2>
		<p class="hint">
			Wähle unter jedem Schritt die Zutaten aus, die dort dazukommen.
			{#if imported}Formuliere die Schritte in eigenen Worten.{/if}
		</p>
		<StepList bind:steps={recipe.steps} ingredients={recipe.ingredients} />
	</section>

	<div class="footer">
		{#if unused.length}
			<p class="hint">
				Diese Zutaten sind noch keinem Schritt zugeordnet: {unused
					.map((i) => i.name || '(leer)')
					.join(', ')}
			</p>
		{/if}
		<div bind:this={problems}>
			{#if issues.length}
				<div class="message message--error" role="alert">
					<p>Bevor du speichern kannst, fehlt noch etwas:</p>
					<ul>
						{#each issues as issue (issue)}<li>{issue}</li>{/each}
					</ul>
				</div>
			{:else if outcome?.error}
				<p class="message message--error" role="alert">{outcome.error}</p>
			{/if}
		</div>
		{#if sessionExpired}
			<p class="message message--error" role="alert">
				Deine Anmeldung ist abgelaufen. Dein Stand ist gesichert.
				<a href={resolve('/anmelden')} target="_blank">Melde dich in einem neuen Fenster an</a> und speichere
				danach noch einmal.
			</p>
		{/if}
		{#if rightsLost}
			<p class="message message--error" role="alert">
				Du darfst dieses Kochbuch nicht mehr bearbeiten. Dein Stand ist gesichert,
				<a href="{resolve('/neu')}?entwurf={encodeURIComponent(draftKey)}"
					>übernimm ihn als eigenes Rezept</a
				>.
			</p>
		{/if}
		{#if outcome?.deleted}
			<p class="message message--error" role="alert">
				Das Rezept wurde {outcome.deleted.by ? `von ${outcome.deleted.by}` : ''} gelöscht. Im Papierkorb
				des Kochbuchs kannst du es wiederherstellen, dein Stand bleibt hier gesichert.
			</p>
		{/if}
		{#if outcome?.conflict && !force}
			<div class="message message--error" role="alert">
				<p>
					{outcome.conflict.by ?? 'Jemand'} hat dieses Rezept {timeAgo(outcome.conflict.at)} geändert.
				</p>
				<div class="row">
					{#if historyHref}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() -->
						<a class="btn" href={historyHref} target="_blank">Änderungen ansehen</a>
					{/if}
					<button type="submit" class="btn" onclick={() => (force = true)}
						>Meine Version speichern</button
					>
					<button
						type="button"
						class="btn btn--quiet"
						onclick={() => {
							clearDraft();
							location.reload();
						}}>Verwerfen</button
					>
				</div>
			</div>
		{/if}
		{#if saving}
			<div class="saving" role="status" aria-live="polite">
				<span class="progress" aria-hidden="true"><span></span></span>
				<span>{savingText}</span>
			</div>
		{/if}
		<div class="footer-actions">
			<span class="public"><Globe size="1em" aria-hidden="true" /> Öffentlich sichtbar</span>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() -->
			<a href={cancelHref} class="btn">Abbrechen</a>
			<button type="submit" class="btn btn--primary" disabled={saving} aria-busy={saving}>
				{#if saving}<span class="spinner" aria-hidden="true"></span>Speichert …{:else}Speichern{/if}
			</button>
		</div>
	</div>
</form>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.editor :global(input:not([type='checkbox'], [type='file'])),
	.editor :global(select),
	.editor :global(textarea) {
		min-width: 0;
		min-height: 2.5rem;
		padding: 0.4rem 0.7rem;
		font: inherit;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.editor :global(input:focus),
	.editor :global(select:focus),
	.editor :global(textarea:focus) {
		border-color: var(--color-text-subtle);
		outline: none;
	}
	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.optional {
		color: var(--color-text-subtle);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1rem;
	}
	.image {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 32rem;
	}
	.image-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.upload {
		position: relative;
		overflow: hidden;
	}
	.upload:focus-within {
		outline: 3px solid var(--color-focus);
		outline-offset: 2px;
	}
	.upload input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.image .hint {
		margin: 0;
	}
	.image img,
	.image-empty {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		border-radius: var(--radius-md);
		background: var(--color-surface-muted);
	}
	.image-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-subtle);
	}
	.footer {
		position: sticky;
		bottom: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 0;
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
	}
	.message p {
		margin: 0 0 0.5rem;
	}
	.message a {
		color: inherit;
	}
	.footer-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	.saving {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}
	.progress {
		position: relative;
		height: 3px;
		overflow: hidden;
		background: var(--color-surface-muted);
		border-radius: var(--radius-pill);
	}
	.progress span {
		position: absolute;
		inset: 0 auto 0 0;
		width: 35%;
		background: var(--color-dark);
		border-radius: inherit;
		animation: progress 1.2s ease-in-out infinite;
	}
	@keyframes progress {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
	.spinner {
		width: 0.9em;
		height: 0.9em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.progress span,
		.spinner {
			animation-duration: 3s;
		}
	}
	.public {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		margin-right: auto;
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
	}
	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
