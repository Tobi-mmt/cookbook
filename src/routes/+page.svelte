<script lang="ts">
	import type { RecipeSummary } from '#types';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		filterRecipes,
		presentCategories,
		type Diet,
		type RecipeFilter
	} from '#lib/recipeFilter.js';

	let { data }: { data: { recipes: RecipeSummary[] } } = $props();

	const categories = $derived(presentCategories(data.recipes));
	const diets: Diet[] = ['Vegetarisch', 'Vegan'];

	const filter = $derived(page.state.filter ?? {});
	const recipes = $derived(filterRecipes(data.recipes, filter));

	// shallow routing keeps the filter in the history entry without loading the page again
	const showFilter = (next: RecipeFilter) =>
		goto(page.url.href, { shallow: true, replace: true, state: { filter: next } });
	const setFilter = (changes: RecipeFilter) => showFilter({ ...filter, ...changes });
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
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
</svelte:head>

<div class="filters" role="group" aria-label="Rezepte filtern">
	<button
		type="button"
		class="chip"
		aria-pressed={!filter.category}
		onclick={() => setFilter({ category: undefined })}>Alle</button
	>
	{#each categories as category (category.id)}
		<button
			type="button"
			class="chip"
			style="--color: {category.color}"
			aria-pressed={filter.category === category.slug}
			onclick={() =>
				setFilter({
					category: filter.category === category.slug ? undefined : category.slug
				})}
		>
			<span class="dot" aria-hidden="true"></span>
			{category.name}
		</button>
	{/each}
	<span class="divider" aria-hidden="true"></span>
	{#each diets as diet (diet)}
		<button
			type="button"
			class="chip"
			aria-pressed={filter.diet === diet}
			onclick={() => setFilter({ diet: filter.diet === diet ? undefined : diet })}>{diet}</button
		>
	{/each}
</div>

{#if recipes.length}
	<div class="recipe-grid">
		{#each recipes as recipe, idx (recipe.id)}
			<RecipePreview {recipe} priority={idx <= 5} />
		{/each}
	</div>
{:else}
	<p class="empty">
		Für diese Auswahl gibt es noch kein Rezept.
		<button type="button" class="reset" onclick={() => showFilter({})}>Filter zurücksetzen</button>
	</p>
{/if}

<style>
	.filters {
		display: flex;
		align-items: center;
		justify-content: safe center;
		gap: 0.5rem;
		padding: 1.25rem 1.5rem 1rem;
		/* centered while it fits, otherwise one row that scrolls sideways on narrow screens */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.filters::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		min-height: 2.25rem;
		padding: 0.35em 0.9em;
		font: inherit;
		font-size: 0.875rem;
		line-height: 1.2;
		color: var(--color-text-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		cursor: pointer;
		transition:
			background-color 0.15s,
			border-color 0.15s;
	}
	.chip:hover {
		border-color: var(--color-text-subtle);
	}
	.chip[aria-pressed='true'] {
		color: #fff;
		background: var(--color-dark);
		border-color: var(--color-dark);
	}
	.dot {
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: var(--color);
	}
	.divider {
		flex: none;
		width: 1px;
		height: 1.5rem;
		margin: 0 0.25rem;
		background: var(--color-border);
	}
	.empty {
		padding: 2rem 1.5rem;
		color: var(--color-text-muted);
	}
	.reset {
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		padding: 0;
		text-decoration: underline;
		cursor: pointer;
	}
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

	/* two columns from 320px on, the tiles size their fonts themselves */
	@media (max-width: 599px) {
		.filters {
			padding: 0.9rem 1rem 0.75rem;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
	}
</style>
