<script lang="ts">
	import type { RecipeInput } from '$lib/recipeInput';
	import RecipeEditor from '$components/admin/RecipeEditor.svelte';

	let { data, form }: { data: { recipe: RecipeInput }; form: { error?: string } | null } = $props();
</script>

<svelte:head>
	<title>Neues Rezept - Unser Kochbuch</title>
</svelte:head>

<h1>Neues Rezept</h1>
<RecipeEditor recipe={data.recipe} image={null} error={form?.error} />

<style>
	h1 {
		font-weight: 200;
	}
</style>
