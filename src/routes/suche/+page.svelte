<script lang="ts">
	import type { RecipeSummary } from '#types';
	import RecipePreview from '#components/RecipePreview.svelte';
	import { resolve } from '$app/paths';
	import SearchField from '#components/SearchField.svelte';
	import { SITE_NAME } from '#lib/site.js';
	import LandingLinks from '#components/LandingLinks.svelte';
	import type { Landing } from '#lib/landings.js';

	let { data }: { data: { query: string; landings: Landing[]; recipes: RecipeSummary[] } } =
		$props();
</script>

<svelte:head>
	<title>„{data.query}“ - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<SearchField action={resolve('/suche')} value={data.query} placeholder="Alle Rezepte durchsuchen" />

{#if data.landings.length}
	<nav class="landings" aria-label="Passende Sammlungen">
		<LandingLinks landings={data.landings} />
	</nav>
{/if}

{#if data.recipes.length}
	<div class="recipe-grid">
		{#each data.recipes as recipe, index (recipe.id)}
			<RecipePreview
				{recipe}
				priority={index <= 5}
				byline={recipe.author ? `von @${recipe.author.username}` : null}
			/>
		{/each}
	</div>
{:else if data.query}
	<p class="empty">Keine Rezepte zu „{data.query}“.</p>
{/if}

<style>
	.landings {
		display: flex;
		justify-content: center;
		padding: 0.75rem 1.5rem 1rem;
	}
	.empty {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--color-text-muted);
	}
	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
	@media (max-width: 599px) {
		.recipe-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		}
	}
</style>
