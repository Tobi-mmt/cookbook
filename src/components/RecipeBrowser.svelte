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
	import type { RecipeSummary } from '#types';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { filterRecipes, presentCategories, type Diet } from '#lib/recipeFilter.js';

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

	const diets: Diet[] = ['Vegetarisch', 'Vegan'];

	// the filter lives in the address, shallow routing changes it without loading the page again
	const url = $derived(page.shallow?.url ?? page.url);
	const category = $derived(url.searchParams.get('kategorie') ?? undefined);
	const diet = $derived((url.searchParams.get('ernaehrung') as Diet | null) ?? undefined);
	const cookbookSlug = $derived(url.searchParams.get('kochbuch'));
	const cookbook = $derived(cookbooks.find(({ slug }) => slug === cookbookSlug));

	let query = $state('');

	const inCookbook = $derived(
		cookbook ? recipes.filter(({ cookbookId }) => cookbookId === cookbook.id) : recipes
	);
	const categories = $derived(presentCategories(inCookbook));
	const visible = $derived(
		filterRecipes(inCookbook, { category, diet }).filter(({ title }) =>
			title.toLowerCase().includes(query.trim().toLowerCase())
		)
	);

	const setParam = (name: string, value: string | null | undefined) => {
		const next = new URL(url.href);
		if (value) next.searchParams.set(name, value);
		else next.searchParams.delete(name);
		goto(next, { shallow: true, replace: true });
	};
	const toggle = (name: string, current: string | null | undefined, value: string) =>
		setParam(name, current === value ? null : value);
</script>

{#if cookbooks.length > 1}
	<div class="filters" role="group" aria-label="Nach Kochbuch filtern">
		<button
			type="button"
			class="chip"
			aria-pressed={!cookbook}
			onclick={() => setParam('kochbuch', null)}>Alle</button
		>
		{#each cookbooks as item (item.id)}
			<button
				type="button"
				class="chip"
				aria-pressed={cookbook?.id === item.id}
				onclick={() => toggle('kochbuch', cookbookSlug, item.slug)}
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

<div class="filters" role="group" aria-label="Rezepte filtern">
	<label class="search">
		<SearchIcon size="1em" aria-hidden="true" />
		<input type="search" placeholder="In diesen Rezepten suchen" bind:value={query} />
	</label>
	<button
		type="button"
		class="chip"
		aria-pressed={!category}
		onclick={() => setParam('kategorie', null)}>Alle</button
	>
	{#each categories as item (item.id)}
		<button
			type="button"
			class="chip"
			style="--color: {item.color}"
			aria-pressed={category === item.slug}
			onclick={() => toggle('kategorie', category, item.slug)}
		>
			<span class="dot" aria-hidden="true"></span>
			{item.name}
		</button>
	{/each}
	<span class="divider" aria-hidden="true"></span>
	{#each diets as item (item)}
		<button
			type="button"
			class="chip"
			aria-pressed={diet === item}
			onclick={() => toggle('ernaehrung', diet, item)}>{item}</button
		>
	{/each}
</div>

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
				goto(page.url.pathname, { shallow: true, replace: true });
			}}>Filter zurücksetzen</button
		>
	</p>
{/if}

<style>
	.filters {
		display: flex;
		align-items: center;
		justify-content: safe center;
		gap: 0.5rem;
		padding: 1rem 1.5rem 0.25rem;
		/* centered while it fits, otherwise one row that scrolls sideways on narrow screens */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.filters:last-of-type {
		padding-bottom: 1rem;
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
	.chip-hint {
		font-size: 0.75rem;
		opacity: 0.75;
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
		margin: 0.5rem 0 0;
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
		.filters {
			justify-content: flex-start;
			padding: 0.75rem 1rem 0.25rem;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
	}
</style>
