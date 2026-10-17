<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import LandingLinks from '#components/LandingLinks.svelte';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { landingPath, type Landing } from '#lib/landings.js';
	import { jsonLdScript, recipeUrl } from '#lib/recipeText.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			landing: { slug: string; title: string; recipes: RecipeSummary[] };
			others: Landing[];
		};
	} = $props();

	const landing = $derived(data.landing);
	const url = $derived(new URL(landingPath(landing.slug), page.url.origin).href);
	const description = $derived(
		`${landing.title}: ${landing.recipes.length} Rezepte aus den Kochbüchern der ${SITE_NAME}, gesammelt von Menschen, die gern kochen. Mit Zutaten, Zubereitung und Portionsrechner.`
	);
	const structuredData = $derived(
		jsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: landing.title,
			description,
			url,
			isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: page.url.origin },
			mainEntity: {
				'@type': 'ItemList',
				itemListElement: landing.recipes.slice(0, 50).map((recipe, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: recipeUrl(recipe, page.url.origin),
					name: recipe.title
				}))
			}
		})
	);
	const image = $derived(
		landing.recipes.find(({ image }) => image)?.image?.variants.webp[0]?.url ?? '/og-image.png'
	);
</script>

<svelte:head>
	<title>{landing.title} - {SITE_NAME}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={landing.title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={new URL(image, page.url.origin).href} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped JSON of own data -->
	{@html structuredData}
</svelte:head>

<header class="intro">
	<p class="crumbs"><a href={resolve('/rezepte')}>Rezepte</a></p>
	<h1>{landing.title}</h1>
	<p class="lead">
		{landing.recipes.length}
		{landing.recipes.length === 1 ? 'Rezept' : 'Rezepte'} aus den Kochbüchern der {SITE_NAME}. Jedes
		Rezept kannst du für deine Portionen umrechnen, die Zutaten auf die Einkaufsliste setzen und in
		dein eigenes Kochbuch übernehmen.
	</p>
</header>

<div class="recipe-grid">
	{#each landing.recipes as recipe, index (recipe.id)}
		<RecipePreview
			{recipe}
			priority={index <= 5}
			byline={recipe.author ? `von @${recipe.author.username}` : null}
		/>
	{/each}
</div>

{#if data.others.length}
	<nav class="more" aria-label="Weitere Kategorien">
		<h2>Weitere Rezepte</h2>
		<LandingLinks landings={data.others} />
	</nav>
{/if}

<style>
	.intro {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 1.5rem;
		text-align: center;
	}
	.crumbs {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
	}
	.crumbs a {
		color: var(--color-text-subtle);
	}
	h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.lead {
		margin: 0.75rem 0 0;
		line-height: 1.6;
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
	.more {
		max-width: 46rem;
		margin: 2.5rem auto 0;
		padding: 0 1.5rem;
	}
	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 400;
	}
	@media (max-width: 599px) {
		.intro {
			padding: 1.5rem 1rem 1rem;
		}
		.recipe-grid {
			--grid-item-min-width: 160px;
		}
		.more {
			padding: 0 1rem;
		}
	}
</style>
