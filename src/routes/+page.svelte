<script lang="ts">
	import { recipes } from '$lib/recipes';
	import RecipePreview from '$components/RecipePreview.svelte';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Unser Kochbuch</title>
	<meta property="og:title" content="Unser Kochbuch" />
	<meta
		name="description"
		content="Unsere Liebelingsrezepte, die wir über die Jahre angesammelt haben."
	/>
	<meta name="author" content="Tobias & Mona" />
	<meta property="og:site_name" content="Unser Kochbuch" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="Unsere Liebelingsrezepte, die wir über die Jahre angesammelt haben."
	/>
	<meta property="og:image" content="{$page.url.origin}/og-image.png" />
</svelte:head>

<div class="recipe-grid">
	{#each recipes as recipe, idx (recipe.id)}
		<RecipePreview {recipe} priority={idx <= 5} />
	{/each}
</div>

<style>
	.recipe-grid {
		--grid-column-count: 3; /* This gets overridden by an inline style. */
		--grid-item-min-width: 250px;
		--grid-item-max-width: calc((100% - (4 - 1) * 96px) / var(--grid-column-count));

		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(max(var(--grid-item-min-width), var(--grid-item-max-width)), 1fr)
		);
		gap: 5em 2.5em;
		max-width: 1250px;
		margin: 2em auto;
		padding: 2em;
	}

	@media (max-width: 700px) {
		.recipe-grid {
			gap: 1em 0.5em;
			font-size: 0.7em;
			padding: 0;
			margin: 1em auto;
		}
	}
</style>
