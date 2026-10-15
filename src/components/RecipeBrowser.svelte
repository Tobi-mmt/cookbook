<script lang="ts">
	import type { RecipeIndexEntry, RecipeSummary } from '#types';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { page } from '$app/state';
	import FilterChips from '#components/FilterChips.svelte';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { resetFilters } from '#lib/filterNavigation.js';
	import { filterRecipes, presentCategories, readFilter } from '#lib/recipeFilter.js';

	let {
		recipes,
		byline = () => null,
		searchPlaceholder = 'Rezept oder Zutat suchen',
		empty
	}: {
		recipes: RecipeSummary[];
		/** e.g. "von Mona" on the tiles of shared cookbooks */
		byline?: (recipe: RecipeSummary) => string | null;
		searchPlaceholder?: string;
		empty?: import('svelte').Snippet;
	} = $props();

	const url = $derived(page.shallow?.url ?? page.url);
	const filter = $derived(readFilter(url));

	let query = $state('');
	let matches = $state<Set<string> | null>(null);
	let search: ((term: string) => Set<string>) | undefined;

	/** loads the titles and ingredients of the shown cookbooks once somebody searches */
	const loadIndex = async () => {
		if (search) return;
		const ids = [...new Set(recipes.map(({ cookbookId }) => cookbookId))];
		const [{ default: Fuse }, ...indexes] = await Promise.all([
			import('fuse.js'),
			...ids.map((id) =>
				fetch(`/api/kochbuch/${id}/index.json`).then(
					(response) => response.json() as Promise<RecipeIndexEntry[]>
				)
			)
		]);
		const fuse = new Fuse(indexes.flat(), {
			minMatchCharLength: 2,
			threshold: 0.4,
			keys: [
				{ name: 'title', weight: 0.8 },
				{ name: 'ingredients.name', weight: 0.2 }
			]
		});
		search = (term) => new Set(fuse.search(term).map(({ item }) => item.id));
	};

	$effect(() => {
		const term = query.trim();
		if (term.length < 2) {
			matches = null;
			return;
		}
		loadIndex().then(() => (matches = search?.(term) ?? null));
	});

	const visible = $derived(
		filterRecipes(recipes, filter).filter(({ id, title }) =>
			matches ? matches.has(id) : title.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
</script>

<!-- the search comes first, the filters below are only there to narrow it down -->
<div class="search-wrap">
	<label class="search">
		<SearchIcon size="1.25em" aria-hidden="true" />
		<input
			type="search"
			placeholder={searchPlaceholder}
			aria-label={searchPlaceholder}
			bind:value={query}
			onfocus={loadIndex}
		/>
	</label>
	{#if query.trim().length > 1}
		<p class="result-count" role="status">
			{visible.length === 1 ? '1 Rezept' : `${visible.length} Rezepte`} zu „{query.trim()}“
		</p>
	{/if}
</div>

<FilterChips categories={presentCategories(recipes)} compact />

{#if visible.length}
	<div class="recipe-grid">
		{#each visible as recipe, index (recipe.id)}
			<RecipePreview {recipe} priority={index <= 5} byline={byline(recipe)} />
		{/each}
	</div>
{:else if !recipes.length && empty}
	{@render empty()}
{:else}
	<p class="empty">
		Für diese Auswahl gibt es noch kein Rezept.
		<button
			type="button"
			class="reset"
			onclick={() => {
				query = '';
				resetFilters();
			}}>Filter zurücksetzen</button
		>
	</p>
{/if}

<style>
	.search-wrap {
		max-width: 36rem;
		margin: 0 auto;
		padding: 1.5rem 1.5rem 0.25rem;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: 3rem;
		padding: 0 1.25rem;
		color: var(--color-text-subtle);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.search:focus-within {
		border-color: var(--color-text-subtle);
	}
	.search input {
		flex: 1;
		min-width: 0;
		font: inherit;
		/* at least 16px, otherwise iOS zooms into the page */
		font-size: 1.0625rem;
		color: var(--color-text);
		background: none;
		border: none;
		outline: none;
	}
	.result-count {
		margin: 0.5rem 0 0;
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-text-subtle);
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
		--grid-column-count: 5;
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
		.search-wrap {
			padding: 1rem 1rem 0.25rem;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
	}
</style>
