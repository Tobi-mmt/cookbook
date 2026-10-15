<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { enhance } from '$app/forms';
	import RecipeEditor from '#components/editor/RecipeEditor.svelte';
	import HiddenNotice from '#components/HiddenNotice.svelte';
	import Dialog from '#components/Dialog.svelte';
	import { recipePath } from '#lib/paths.js';
	import type { RecipeInput } from '#lib/recipeInput.js';
	import { SITE_NAME } from '#lib/site.js';
	import { slugerize } from '#lib/slugerize.js';
	import { resolve } from '$app/paths';
	import type { Conflict } from '#lib/server/recipeActions.js';

	let {
		data,
		form
	}: {
		data: {
			id: string;
			recipe: RecipeInput;
			image: RecipeImage | null;
			categories: Category[];
			asAdmin: boolean;
			hiddenReason?: string | null;
			version: number;
		};
		form: { error?: string; conflict?: Conflict; deleted?: { by: string | null } } | null;
	} = $props();

	let confirmDelete = $state(false);
</script>

<svelte:head>
	<title>{data.recipe.title} bearbeiten - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>{data.recipe.title}</h1>
	{#if data.hiddenReason}
		<HiddenNotice type="recipe" id={data.id} reason={data.hiddenReason} />
	{/if}
	{#if data.asAdmin}
		<p class="message">Du bearbeitest als Admin ein fremdes Rezept.</p>
	{/if}
	{#key data.id}
		<RecipeEditor
			recipe={data.recipe}
			image={data.image}
			categories={data.categories}
			action="?/save"
			cancelHref={recipePath({ id: data.id, title: data.recipe.title })}
			version={data.version}
			draftKey={data.id}
			historyHref={resolve('/rezept/[id]/[titel]/verlauf', {
				id: data.id,
				titel: slugerize(data.recipe.title)
			})}
			result={form}
		/>
	{/key}

	<section class="danger">
		<button type="button" class="btn btn--danger" onclick={() => (confirmDelete = true)}
			>Rezept löschen</button
		>
	</section>

	<Dialog bind:open={confirmDelete} title="„{data.recipe.title}“ löschen?">
		<p>
			Das Rezept kommt für 30 Tage in den Papierkorb des Kochbuchs. Kopien, die andere bereits
			übernommen haben, bleiben bestehen.
		</p>
		<form id="delete-recipe" method="POST" action="?/delete" use:enhance></form>
		{#snippet actions()}
			<button type="button" class="btn btn--quiet" onclick={() => (confirmDelete = false)}
				>Abbrechen</button
			>
			<button type="submit" class="btn btn--danger" form="delete-recipe">Löschen</button>
		{/snippet}
	</Dialog>
</div>

<style>
	.danger {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}
</style>
