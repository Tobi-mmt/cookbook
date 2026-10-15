<script lang="ts">
	import type { Category, RecipeImage } from '#types';
	import { page } from '$app/state';
	import type { RecipeInput } from '#lib/recipeInput.js';
	import RecipeEditor from '#components/admin/RecipeEditor.svelte';

	let {
		data,
		form
	}: {
		data: { id: string; recipe: RecipeInput; image: RecipeImage | null; categories: Category[] };
		form: { error?: string } | null;
	} = $props();
</script>

<svelte:head>
	<title>{data.recipe.title} bearbeiten - Unser Kochbuch</title>
</svelte:head>

<h1>{data.recipe.title}</h1>
{#if page.url.searchParams.has('imported')}
	<p class="notice">Importiert – bitte prüfen und speichern, um es zu veröffentlichen.</p>
{/if}
{#key data.id}
	<RecipeEditor
		recipe={data.recipe}
		image={data.image}
		categories={data.categories}
		error={form?.error}
	/>
{/key}

<style>
	h1 {
		font-weight: 200;
	}
</style>
