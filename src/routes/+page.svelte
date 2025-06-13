<script lang="ts">
	import { recipes } from '$lib/recipes';
	import RecipePreview from '$components/RecipePreview.svelte';
</script>

<svelte:head>
	<title>Tobi's Kochbuch</title>
	<meta
		name="description"
		content="Meine Liebelingsrezepte, die ich über die Jahre angesammelt habe."
	/>
	<meta name="author" content="Tobias" />
</svelte:head>

<div class="recipe-grid">
	{#each recipes as recipe, idx (recipe.id)}
		<RecipePreview {recipe} loading={idx <= 5 ? 'eager' : 'lazy'} />
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
