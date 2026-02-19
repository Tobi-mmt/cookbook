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
		--grid-column-count: 5; /* This gets overridden by an inline style. */
		--grid-item-min-width: 250px;
		--grid-item-max-width: calc((100% - (3) * 96px) / var(--grid-column-count));

		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(max(var(--grid-item-min-width), var(--grid-item-max-width)), 1fr)
		);
	}

	@media (max-width: 599px) {
		.recipe-grid {
			--grid-item-min-width: 200px;
			font-size: 0.7em;
		}
	}
</style>
