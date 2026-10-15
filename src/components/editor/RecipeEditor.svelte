<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { enhance, type SubmitFunction } from '$app/forms';
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
		error
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
		error?: string;
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
		formData.set('recipe', JSON.stringify(recipe));
		formData.delete('image');
		if (imageFile) formData.set('image', imageFile, 'image.jpg');
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
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
		{#if error}<p class="message message--error" role="alert">{error}</p>{/if}
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
