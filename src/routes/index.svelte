<script lang="ts">
	import { recipes } from '../lib/recipes';
	import Recipe from '../components/Recipe.svelte';
</script>

<svelte:head>
	<title>Tobi's Kochbuch</title>
	<meta
		name="description"
		content="Meine Liebelingsrezepte, die ich über die Jahre angesammelt habe."
	/>
	<meta name="author" content="Tobias" />
</svelte:head>

{#each recipes as recipe}
	<Recipe {recipe} />
{/each}
