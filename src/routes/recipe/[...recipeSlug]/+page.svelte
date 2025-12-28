<script lang="ts">
	import type { Recipe } from '$types';
	import RecipeComponent from '$components/Recipe.svelte';
	import { resolve } from '$app/paths';

	export let data: { recipe: Recipe };
</script>

<svelte:head>
	<title>{data.recipe && `${data.recipe.title} - `} Unser Kochbuch</title>
	{#if data.recipe && data.recipe.description}
		<meta name="description" content={data.recipe.description} />
	{:else}
		<meta
			name="description"
			content="Unsere Liebelingsrezepte, die wir über die Jahre angesammelt haben."
		/>
	{/if}
	<meta name="author" content="Tobias & Mona" />
</svelte:head>

{#if data.recipe}
	{#key data.recipe}
		<RecipeComponent recipe={data.recipe} />
	{/key}
{:else}
	<h1>Kein Rezept gefunden</h1>
	<p>
		Gehe zur <a href={resolve('/', {})}>Übersicht</a> oder benutze die Suche, um ein Rezept zu finden.
	</p>
{/if}
