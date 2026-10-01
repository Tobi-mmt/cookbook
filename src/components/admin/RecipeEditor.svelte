<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { RecipeImage } from '$types';
	import { enhance } from '$app/forms';
	import {
		CATEGORIES,
		NUTRITION_TYPES,
		findUnusedIngredients,
		type RecipeInput
	} from '$lib/recipeInput';
	import IngredientList from './IngredientList.svelte';
	import StepList from './StepList.svelte';
	import { resizeImage } from './resizeImage';

	let {
		recipe: initialRecipe,
		image,
		error
	}: { recipe: RecipeInput; image: RecipeImage | null; error?: string } = $props();

	// the editor works on a copy, the page re-creates it via {#key} for another recipe
	// svelte-ignore state_referenced_locally
	let recipe = $state(structuredClone(initialRecipe));
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

<form method="POST" enctype="multipart/form-data" use:enhance={submit} class="editor">
	<section class="card">
		<h2>Allgemein</h2>
		<label class="field">
			Titel
			<input bind:value={recipe.title} required />
		</label>
		<label class="field">
			Beschreibung <span class="hint">(optional)</span>
			<textarea rows="3" bind:value={recipe.description}></textarea>
		</label>
		<label class="field">
			Quelle <span class="hint">(optional)</span>
			<input type="url" bind:value={recipe.sourceUrl} />
		</label>
		<div class="grid">
			<label class="field">
				Portionen
				<input type="number" min="1" step="1" bind:value={recipe.portion} required />
			</label>
			<label class="field">
				Dauer (min)
				<input type="number" min="1" step="1" bind:value={recipe.duration} required />
			</label>
			<label class="field">
				Kategorie
				<select bind:value={recipe.category}>
					{#each CATEGORIES as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</label>
			<label class="field">
				Ernährung
				<select bind:value={recipe.nutritionType}>
					{#each NUTRITION_TYPES as nutritionType (nutritionType)}
						<option value={nutritionType}>{nutritionType}</option>
					{/each}
				</select>
			</label>
		</div>
	</section>

	<section class="card">
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
			{#if imageError}<p class="error">{imageError}</p>{/if}
		</div>
	</section>

	<section class="card">
		<h2>Zutaten</h2>
		<p class="hint">Mengen beziehen sich auf {recipe.portion} Portionen.</p>
		<IngredientList bind:ingredients={recipe.ingredients} onremove={removeLinks} />
	</section>

	<section class="card">
		<h2>Zubereitung</h2>
		<p class="hint">Klicke die Zutaten an, die in einem Schritt verwendet werden.</p>
		<StepList bind:steps={recipe.steps} ingredients={recipe.ingredients} />
	</section>

	<div class="footer">
		{#if unused.length}
			<p class="warning">
				Diese Zutaten sind noch keinem Schritt zugeordnet: {unused
					.map((i) => i.name || '(leer)')
					.join(', ')}
			</p>
		{/if}
		{#if error}<p class="error">{error}</p>{/if}
		<div class="footer-actions">
			<a href={resolve('/admin', {})} class="button">Abbrechen</a>
			<button type="submit" class="button button--primary" disabled={saving}>
				{saving ? 'Speichert…' : 'Speichern'}
			</button>
		</div>
	</div>
</form>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}
	h2 {
		font-weight: 400;
		font-size: 1.25em;
		margin: 0;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.25em;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
		gap: 0.75em;
	}
	.hint {
		color: #777;
		font-size: 0.9em;
		margin: 0;
	}
	.image {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
		max-width: 32em;
	}
	.image img,
	.image-empty {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		border-radius: 6px;
		background: #eee;
	}
	.image-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #888;
	}
	.footer {
		position: sticky;
		bottom: 0;
		background: #fff;
		padding: 1em 0;
		border-top: 1px solid #ddd;
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}
	.footer p {
		margin: 0;
	}
	.footer-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5em;
	}
</style>
