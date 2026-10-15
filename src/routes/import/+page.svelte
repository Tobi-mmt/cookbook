<script lang="ts">
	import type { Category } from '#types';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
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
		form: { imported?: ImportResult; url?: string; error?: string } | null;
	} = $props();

	// svelte-ignore state_referenced_locally
	let cookbookId = $state(data.cookbookId);
	let importing = $state(false);
	let confirmedDuplicate = $state(false);

	const imported = $derived(form?.imported);
	const showEditor = $derived(imported && (!imported.duplicate || confirmedDuplicate));

	const submit: SubmitFunction = () => {
		importing = true;
		confirmedDuplicate = false;
		return async ({ result, update }) => {
			if (result.type === 'error') console.error(result.error);
			await update({ reset: false });
			importing = false;
		};
	};
</script>

<svelte:head>
	<title>Rezept importieren - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Rezept importieren</h1>

	{#if showEditor && imported}
		<p class="message">
			Bitte prüfe das Rezept. Gespeichert wird es erst mit „Speichern“.
			{#if imported.imageSkipped}
				Das Bild der Originalseite wurde nicht übernommen, weil es urheberrechtlich geschützt ist.
				Lade ein eigenes Foto hoch, such dir ein freies Bild (z. B. auf Unsplash, Pixabay oder
				Wikimedia Commons) oder lass dir eins mit KI erzeugen und lade es danach hoch.
			{/if}
		</p>
		<RecipeEditor
			recipe={imported.input}
			image={null}
			categories={data.categories}
			cookbooks={data.cookbooks}
			{cookbookId}
			action={resolve('/neu')}
			cancelHref={resolve('/import')}
			draftKey="import:{imported.url}"
			importedImage={imported.image && { ...imported.image, sourceUrl: imported.url }}
			imported
		/>
	{:else}
		<form method="POST" class="stack" use:enhance={submit}>
			<p class="hint">
				Funktioniert mit allen Seiten, die Rezepte nach dem schema.org-Standard auszeichnen, z. B.
				Chefkoch oder lecker.de.
			</p>
			<label class="field">
				Adresse des Rezepts
				<input
					class="input"
					type="url"
					name="url"
					value={form?.url ?? imported?.url ?? ''}
					placeholder="https://www.chefkoch.de/rezepte/…"
					required
					readonly={importing}
				/>
			</label>
			{#if data.cookbooks.length > 1}
				<label class="field">
					Kochbuch
					<select class="input" name="cookbookId" bind:value={cookbookId}>
						{#each data.cookbooks as cookbook (cookbook.id)}
							<option value={cookbook.id}>{cookbook.name}</option>
						{/each}
					</select>
				</label>
			{:else}
				<input type="hidden" name="cookbookId" value={cookbookId} />
			{/if}
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
			{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
			<div class="row actions">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- from the server -->
				<a class="btn btn--quiet" href={data.cancelHref}>Abbrechen</a>
				<button type="submit" class="btn btn--primary" disabled={importing}>
					{importing ? 'Wird gelesen…' : 'Importieren'}
				</button>
			</div>
			{#if importing}
				<p class="hint" role="status">Das Rezept wird geladen. Das kann einen Moment dauern.</p>
			{/if}
		</form>
	{/if}
</div>

<style>
	.actions {
		justify-content: flex-end;
	}
	.message p {
		margin: 0 0 0.75rem;
	}
	a {
		color: inherit;
	}
</style>
