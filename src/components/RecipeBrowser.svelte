<script lang="ts" module>
	export type CookbookChip = {
		id: string;
		slug: string;
		name: string;
		href: string;
		/** e.g. "gemeinsam mit Mona" */
		hint?: string;
	};
</script>

<script lang="ts">
	import type { RecipeIndexEntry, RecipeSummary } from '#types';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { page } from '$app/state';
	import FilterChips from '#components/FilterChips.svelte';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { resetFilters, setFilterParam } from '#lib/filterNavigation.js';
	import { filterRecipes, presentCategories, readFilter } from '#lib/recipeFilter.js';

	let {
		recipes,
		cookbooks = [],
		byline = () => null,
		empty
	}: {
		recipes: RecipeSummary[];
		/** chips to filter by cookbook, only shown with more than one */
		cookbooks?: CookbookChip[];
		/** e.g. "von Mona" on the tiles of shared cookbooks */
		byline?: (recipe: RecipeSummary) => string | null;
		empty?: import('svelte').Snippet;
	} = $props();

	const url = $derived(page.shallow?.url ?? page.url);
	const filter = $derived(readFilter(url));
	const cookbookSlug = $derived(url.searchParams.get('kochbuch'));
	const cookbook = $derived(cookbooks.find(({ slug }) => slug === cookbookSlug));

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

	const inCookbook = $derived(
		cookbook ? recipes.filter(({ cookbookId }) => cookbookId === cookbook.id) : recipes
	);
	const visible = $derived(
		filterRecipes(inCookbook, filter).filter(({ id, title }) =>
			matches ? matches.has(id) : title.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
</script>

{#if cookbooks.length > 1}
	<div class="cookbooks" role="group" aria-label="Nach Kochbuch filtern">
		<button
			type="button"
			class="chip"
			aria-pressed={!cookbook}
			onclick={() => setFilterParam('kochbuch', null)}>Alle</button
		>
		{#each cookbooks as item (item.id)}
			<button
				type="button"
				class="chip"
				aria-pressed={cookbook?.id === item.id}
				onclick={() => setFilterParam('kochbuch', cookbookSlug === item.slug ? null : item.slug)}
			>
				{item.name}
				{#if item.hint}<span class="chip-hint">{item.hint}</span>{/if}
			</button>
		{/each}
	</div>
{/if}

{#if cookbook}
	<p class="cookbook-link">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() -->
		<a href={cookbook.href}>Kochbuch öffnen</a>
		<span>„{cookbook.name}“{cookbook.hint ? `, ${cookbook.hint}` : ''}</span>
	</p>
{/if}

<FilterChips categories={presentCategories(inCookbook)}>
	<label class="search">
		<SearchIcon size="1em" aria-hidden="true" />
		<input
			type="search"
			placeholder="Rezept oder Zutat suchen"
			aria-label="In diesen Rezepten suchen"
			bind:value={query}
			onfocus={loadIndex}
		/>
	</label>
</FilterChips>

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
	.cookbooks {
		display: flex;
		align-items: center;
		justify-content: safe center;
		gap: 0.5rem;
		padding: 1rem 1.5rem 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.cookbooks::-webkit-scrollbar {
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
	}
	.chip:hover {
		border-color: var(--color-text-subtle);
	}
	.chip[aria-pressed='true'] {
		color: #fff;
		background: var(--color-dark);
		border-color: var(--color-dark);
	}
	.chip-hint {
		font-size: 0.75rem;
		opacity: 0.75;
	}
	.search {
		flex: none;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		height: 2.25rem;
		padding: 0 0.9rem;
		color: var(--color-text-subtle);
		background: var(--color-surface-muted);
		border-radius: var(--radius-pill);
	}
	.search input {
		width: 11rem;
		font: inherit;
		/* at least 16px, otherwise iOS zooms into the page */
		font-size: 1rem;
		color: var(--color-text);
		background: none;
		border: none;
		outline: none;
	}
	.cookbook-link {
		margin: 0.75rem 0 0;
		text-align: center;
		font-size: 0.875rem;
	}
	.cookbook-link a {
		color: var(--color-text);
	}
	.cookbook-link span {
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
		.cookbooks {
			justify-content: flex-start;
			padding: 0.75rem 1rem 0;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
	}
</style>
