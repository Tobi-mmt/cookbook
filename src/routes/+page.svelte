<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import FilterChips from '#components/FilterChips.svelte';
	import Hero from '#components/Hero.svelte';
	import SearchField from '#components/SearchField.svelte';
	import RecipeBrowser from '#components/RecipeBrowser.svelte';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { me } from '#lib/me.svelte.js';
	import { setFilterParam } from '#lib/filterNavigation.js';
	import { filterRecipes, presentCategories, readFilter } from '#lib/recipeFilter.js';
	import { SITE_NAME, SITE_TAGLINE } from '#lib/site.js';
	import { jsonLdScript } from '#lib/recipeText.js';
	import LandingLinks from '#components/LandingLinks.svelte';
	import type { Landing } from '#lib/landings.js';

	let {
		data
	}: {
		data: {
			popular: RecipeSummary[];
			fresh: RecipeSummary[];
			landings: Landing[];
			ingredients: Landing[];
		};
	} = $props();

	const url = $derived(page.shallow?.url ?? page.url);
	const filter = $derived(readFilter(url));
	const user = $derived(me.current?.user);

	// the page is cached for everybody, the own recipes come from the browser
	let ownRecipes = $state<RecipeSummary[]>([]);
	let ownRecipesLoaded = $state(false);
	$effect(() => {
		if (!user) {
			ownRecipes = [];
			return;
		}
		fetch('/api/me/rezepte')
			.then((response) => response.json())
			.then((list: RecipeSummary[]) => {
				ownRecipes = list;
				ownRecipesLoaded = true;
			})
			.catch(console.error);
	});

	/** with own recipes the page opens with them, "Entdecken" shows the recipes of others */
	const hasTabs = $derived(ownRecipes.length > 0);
	const tab = $derived(
		hasTabs && url.searchParams.get('ansicht') !== 'entdecken' ? 'meine' : 'entdecken'
	);

	const categories = $derived(presentCategories([...data.popular, ...data.fresh]));
	const sections = $derived([
		{ title: null, recipes: filterRecipes(data.popular, filter) },
		{ title: 'Neu', recipes: filterRecipes(data.fresh, filter) }
	]);

	let tabs = $state<HTMLElement>();
	const showTab = async (next: 'meine' | 'entdecken') => {
		await setFilterParam('ansicht', next === 'entdecken' ? 'entdecken' : null);
		tabs?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};
</script>

<svelte:head>
	<title>{SITE_NAME} – {SITE_TAGLINE}</title>
	<meta property="og:title" content={SITE_NAME} />
	<meta
		name="description"
		content="Rezepte digital speichern, aus Links importieren und zusammen mit Familie und Freunden in gemeinsamen Kochbüchern pflegen. Kostenlos und ohne Werbung."
	/>
	<link rel="canonical" href="{page.url.origin}/" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped JSON of own data -->
	{@html jsonLdScript({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		description: SITE_TAGLINE,
		url: `${page.url.origin}/`,
		inLanguage: 'de',
		potentialAction: {
			'@type': 'SearchAction',
			target: `${page.url.origin}/suche?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	})}
</svelte:head>

{#if !user}
	<Hero recipes={data.popular} discoverHref="#rezepte" />
{/if}

<!-- one fixed place above the search for the switch or the first recipe, so that nothing moves
	once the person is known; guests have the hero instead -->
<div class="slot" class:slot--guest={!user && !hasTabs} id="rezepte">
	{#if hasTabs}
		<div class="tabs" role="tablist" aria-label="Rezepte" bind:this={tabs}>
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'meine'}
				onclick={() => showTab('meine')}>Meine Rezepte</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'entdecken'}
				onclick={() => showTab('entdecken')}>Entdecken</button
			>
		</div>
	{:else if user && ownRecipesLoaded}
		<a class="btn" href={resolve('/neu')}>Erstes Rezept anlegen</a>
	{/if}
</div>

{#if tab === 'meine'}
	<!-- the search covers only the chosen part: here the own recipes -->
	<RecipeBrowser
		recipes={ownRecipes}
		searchPlaceholder="In meinen Rezepten suchen"
		byline={(recipe) =>
			recipe.author && recipe.author.username !== user?.username
				? `von ${recipe.author.name}`
				: null}
	/>
	<p class="more">
		<button type="button" class="btn" onclick={() => showTab('entdecken')}>Weiter entdecken</button>
	</p>
{:else}
	<SearchField action={resolve('/suche')} placeholder="Alle Rezepte durchsuchen" />

	<FilterChips {categories} compact />

	{#each sections as section (section.title)}
		{#if section.recipes.length}
			<section>
				{#if section.title}<h2>{section.title}</h2>{/if}
				<div class="recipe-grid">
					{#each section.recipes as recipe, index (recipe.id)}
						<RecipePreview
							{recipe}
							priority={!section.title && index <= 5}
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
{/if}

{#if data.landings.length}
	<nav class="explore" aria-label="Rezepte nach Kategorie und Zutat">
		<h2>Rezepte nach Kategorie</h2>
		<LandingLinks landings={data.landings} />
		{#if data.ingredients.length}
			<h2>Beliebte Zutaten</h2>
			<LandingLinks landings={data.ingredients} />
		{/if}
		<p><a href={resolve('/rezepte')}>Alle Kategorien und Zutaten</a></p>
	</nav>
{/if}

<style>
	.explore {
		max-width: 46rem;
		margin: 3rem auto 0;
		padding: 0 1.5rem;
	}
	.explore h2 {
		margin: 1.5rem 0 0.75rem;
	}
	.explore p {
		margin: 1rem 0 0;
		font-size: 0.9375rem;
	}
	.explore a {
		color: var(--color-text-muted);
	}
	@media (max-width: 599px) {
		.explore {
			padding: 0 1rem;
		}
	}
	.slot {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 2.75rem;
		margin: 1.5rem 1.5rem 0;
		scroll-margin-top: var(--top-bar-height);
	}
	:global(html:not(.signed-in)) .slot--guest {
		min-height: 0;
		margin-top: 0.5rem;
	}
	.tabs {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
		width: fit-content;
		padding: 0.25rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-pill);
		scroll-margin-top: calc(var(--top-bar-height) + 1rem);
	}
	.tabs button {
		min-height: 2.25rem;
		padding: 0.35rem 1.1rem;
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.tabs button[aria-selected='true'] {
		color: var(--color-text);
		background: var(--color-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}
	.more {
		display: flex;
		justify-content: center;
		margin: 2.5rem 0 0;
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
