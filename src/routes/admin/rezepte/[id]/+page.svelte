<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			recipe: {
				id: string;
				title: string;
				slug: string;
				hasImage: boolean;
				hiddenReason: string | null;
				deleted: boolean;
			};
			cookbook?: { id: string; name: string };
		};
		form: { saved?: string; error?: string } | null;
	} = $props();

	const recipe = $derived(data.recipe);
	const params = $derived({ id: recipe.id, titel: recipe.slug });
</script>

<svelte:head>
	<title>{recipe.title} - {SITE_NAME}</title>
</svelte:head>

<p><a href={resolve('/admin/rezepte')}>← Rezepte</a></p>
<h1>{recipe.title}</h1>
{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
{#if recipe.deleted}<p class="message message--error">Im Papierkorb</p>{/if}
{#if recipe.hiddenReason}<p class="message message--error">
		Ausgeblendet: {recipe.hiddenReason}
	</p>{/if}

<p class="row">
	<a class="btn" href={resolve('/rezept/[id]/[[titel]]', params)} target="_blank">Ansehen</a>
	<a class="btn" href={resolve('/rezept/[id]/[titel]/bearbeiten', params)}>Bearbeiten</a>
	<a class="btn" href={resolve('/rezept/[id]/[titel]/verlauf', params)}>Verlauf</a>
	{#if data.cookbook}
		<a class="btn" href={resolve('/admin/kochbuecher/[id]', { id: data.cookbook.id })}
			>Kochbuch „{data.cookbook.name}“</a
		>
	{/if}
</p>

<h2>Verschieben</h2>
<form method="POST" action="?/move" class="row" use:enhance>
	<input class="input" name="target" placeholder="@person/kochbuch" required />
	<button type="submit" class="btn">Verschieben</button>
</form>

<h2>Maßnahmen</h2>
<form method="POST" class="stack" use:enhance>
	{#if !recipe.hiddenReason}
		<label class="field">Grund fürs Ausblenden <input class="input" name="reason" /></label>
	{/if}
	<div class="row">
		{#if recipe.hasImage}
			<button type="submit" class="btn btn--danger" formaction="?/removeImage"
				>Bild entfernen</button
			>
		{/if}
		{#if recipe.hiddenReason}
			<button type="submit" class="btn" formaction="?/unhide">Wieder einblenden</button>
		{:else}
			<button type="submit" class="btn" formaction="?/hide">Ausblenden</button>
		{/if}
		{#if recipe.deleted}
			<button type="submit" class="btn" formaction="?/restore">Wiederherstellen</button>
		{:else}
			<button type="submit" class="btn btn--danger" formaction="?/delete">Löschen</button>
		{/if}
	</div>
</form>

<style>
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
</style>
