<script lang="ts">
	import type { RecipeImage } from '$types';
	import type { RecipeInput } from '$lib/recipeInput';
	import RecipeEditor from '$components/admin/RecipeEditor.svelte';

	let {
		data,
		form
	}: {
		data: { id: string; recipe: RecipeInput; image: RecipeImage | null };
		form: { error?: string } | null;
	} = $props();
</script>

<svelte:head>
	<title>{data.recipe.title} bearbeiten - Unser Kochbuch</title>
</svelte:head>

<h1>{data.recipe.title}</h1>
{#key data.id}
	<RecipeEditor recipe={data.recipe} image={data.image} error={form?.error} />
{/key}

<style>
	h1 {
		font-weight: 200;
	}
</style>
