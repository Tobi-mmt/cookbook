<script lang="ts">
	import type { Recipe } from '$types';
	import RecipeComponent from '$components/Recipe.svelte';

	export let data: { recipe: Recipe };
</script>

<svelte:head>
	<title>Tobi's Kochbuch</title>
	<meta
		name="description"
		content="Meine Liebelingsrezepte, die ich über die Jahre angesammelt habe."
	/>
	<meta name="author" content="Tobias" />
</svelte:head>

{#if data.recipe}
	{#key data.recipe}
		<RecipeComponent recipe={data.recipe} />
	{/key}
{:else}
	<h1>Kein Rezept gefunden</h1>
	<p>Gehe zur <a href="/">Übersicht</a> oder benutze die Suche, um ein Rezept zu finden.</p>
{/if}
