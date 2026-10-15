<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Conflict } from '#lib/server/recipeActions.js';
	import Globe from '@lucide/svelte/icons/globe';
	import { NUTRITION_TYPES, findUnusedIngredients, type RecipeInput } from '#lib/recipeInput.js';
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
		result?: { error?: string; conflict?: Conflict; deleted?: { by: string | null } } | null;
	} = $props();

	// the editor works on a copy, the page re-creates it via {#key} for another recipe
	// svelte-ignore state_referenced_locally
	let recipe = $state(structuredClone(initialRecipe));
	// svelte-ignore state_referenced_locally
	let selectedCookbook = $state(cookbookId ?? cookbooks?.[0]?.id ?? '');
	let imageFile = $state<Blob | null>(null);
	let previewUrl = $state<string | null>(null);
	let imageError = $state<string | null>(null);
	let saving = $state(false);
	let force = $state(false);
	let sessionExpired = $state(false);
	let rightsLost = $state(false);
	let draft = $state<{ recipe: RecipeInput; savedAt: number } | null>(null);

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

	const submit: SubmitFunction = ({ formData }) => {
		saving = true;
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
						recipe = structuredClone(draft!.recipe);
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
			Quelle <span class="optional">(optional, Pflicht bei Rezepten von anderen Seiten)</span>
			<input class="input" type="url" bind:value={recipe.sourceUrl} />
		</label>
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
			{:else}
				<div class="image-empty">Noch kein Bild</div>
			{/if}
			<label class="field">
				{currentPreview ? 'Bild ersetzen' : 'Bild hochladen'}
				<input
					type="file"
					name="image"
					accept="image/jpeg,image/png,image/webp"
					onchange={onImageChange}
				/>
			</label>
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
			Klicke die Zutaten an, die in einem Schritt verwendet werden.
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
		{#if result?.error}<p class="message message--error" role="alert">{result.error}</p>{/if}
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
		{#if result?.deleted}
			<p class="message message--error" role="alert">
				Das Rezept wurde {result.deleted.by ? `von ${result.deleted.by}` : ''} gelöscht. Im Papierkorb
				des Kochbuchs kannst du es wiederherstellen, dein Stand bleibt hier gesichert.
			</p>
		{/if}
		{#if result?.conflict && !force}
			<div class="message message--error" role="alert">
				<p>
					{result.conflict.by ?? 'Jemand'} hat dieses Rezept {timeAgo(result.conflict.at)} geändert.
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
		<div class="footer-actions">
			<span class="public"><Globe size="1em" aria-hidden="true" /> Öffentlich sichtbar</span>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() -->
			<a href={cancelHref} class="btn">Abbrechen</a>
			<button type="submit" class="btn btn--primary" disabled={saving}>
				{saving ? 'Speichert…' : 'Speichern'}
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
