<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import FilterChips from '#components/FilterChips.svelte';
	import HeroSearch from '#components/HeroSearch.svelte';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { me } from '#lib/me.svelte.js';
	import { profilePath } from '#lib/paths.js';
	import { filterRecipes, presentCategories, readFilter } from '#lib/recipeFilter.js';
	import { SITE_NAME } from '#lib/site.js';

	let { data }: { data: { popular: RecipeSummary[]; fresh: RecipeSummary[] } } = $props();

	const filter = $derived(readFilter(page.shallow?.url ?? page.url));
	const categories = $derived(presentCategories([...data.popular, ...data.fresh]));
	const sections = $derived([
		{ title: 'Beliebt', recipes: filterRecipes(data.popular, filter) },
		{ title: 'Neu', recipes: filterRecipes(data.fresh, filter) }
	]);
	const user = $derived(me.current?.user);
</script>

<svelte:head>
	<title>{SITE_NAME}</title>
	<meta property="og:title" content={SITE_NAME} />
	<meta
		name="description"
		content="Kochbücher zum Teilen: Rezepte sammeln, gemeinsam bearbeiten und von anderen übernehmen."
	/>
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
</svelte:head>

<HeroSearch />

<p class="entry">
	{#if user}
		<a class="btn" href={profilePath(user.username)}>Meine Rezepte</a>
	{:else if me.current}
		<a class="btn btn--primary" href={resolve('/anmelden')}>Eigenes Kochbuch anlegen</a>
	{/if}
</p>

<FilterChips {categories} />

{#each sections as section (section.title)}
	{#if section.recipes.length}
		<section>
			<h2>{section.title}</h2>
			<div class="recipe-grid">
				{#each section.recipes as recipe, index (recipe.id)}
					<RecipePreview
						{recipe}
						priority={section.title === 'Beliebt' && index <= 5}
						byline={recipe.author ? `von @${recipe.author.username}` : null}
					/>
				{/each}
			</div>
		</section>
	{/if}
{/each}

{#if !sections.some(({ recipes }) => recipes.length)}
	<p class="empty">Für diese Auswahl gibt es noch kein Rezept.</p>
{/if}

<style>
	.entry {
		display: flex;
		justify-content: center;
		min-height: 2.5rem;
		margin: 1rem 0 0;
	}
	h2 {
		margin: 1.5rem 1.5rem 0.75rem;
		font-size: 1.25rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.empty {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--color-text-muted);
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
	@media (max-width: 599px) {
		h2 {
			margin: 1rem 1rem 0.5rem;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
	}
</style>
