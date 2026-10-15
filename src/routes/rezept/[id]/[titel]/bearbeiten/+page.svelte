<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { enhance } from '$app/forms';
	import RecipeEditor from '#components/editor/RecipeEditor.svelte';
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
		{#if confirmDelete}
			<form method="POST" action="?/delete" class="stack" use:enhance>
				<p>Wirklich löschen? Kopien, die andere bereits übernommen haben, bleiben bestehen.</p>
				<div class="row">
					<button type="submit" class="btn btn--danger">Rezept löschen</button>
					<button type="button" class="btn btn--quiet" onclick={() => (confirmDelete = false)}
						>Abbrechen</button
					>
				</div>
			</form>
		{:else}
			<button type="button" class="btn btn--danger" onclick={() => (confirmDelete = true)}
				>Rezept löschen</button
			>
		{/if}
	</section>
</div>

<style>
	.danger {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}
	.danger p {
		margin: 0;
	}
</style>
