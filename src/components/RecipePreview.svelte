<script lang="ts">
	import type { Recipe } from '$types';

	import { slugerize } from '$lib/slugerize';
	import { categoryColors } from '$lib/colors';
	import { getIconName } from '$lib/iconName';
	import Icon from '$components/Icon.svelte';
	import { resolve } from '$app/paths';
	import RecipeImage from '$components/RecipeImage.svelte';

	export let recipe: Recipe;
	export let priority: boolean = false;
</script>

<a
	href={resolve(`/recipe/[recipeId]/[recipeTitle]`, {
		recipeId: recipe.id,
		recipeTitle: slugerize(recipe.title)
	})}
>
	<div
		id={slugerize(recipe.title)}
		class="recipe-preview"
		style={`
  --highlight-color: ${categoryColors[recipe.meta.category]};
  --highlight-color-light: ${categoryColors[recipe.meta.category]}77;
  `}
	>
		<div>
			<div class="header">
				<div class="imageWrapper">
					{#if recipe.image}
						<div
							class="imagePlaceholder"
							style={`background-image: url(${recipe.image.placeholder});`}
						></div>
						<RecipeImage
							class="image"
							fetchpriority={priority ? 'high' : 'auto'}
							loading={priority ? 'eager' : 'lazy'}
							image={recipe.image}
							sizes="(min-width: 1320px) 369px, (min-width: 900px) 29.25vw, (min-width: 740px) calc(54.29vw - 90px), (min-width: 700px) calc(660vw - 4450px), (min-width: 540px) 32.86vw, (min-width: 360px) 50vw, 100vw"
							alt={recipe.title}
						/>
					{:else}
						<div class="imagePlaceholder"></div>
					{/if}
				</div>
				<div class="infos">
					<p class="category">{recipe.meta.category}</p>
					<h2 class="title">{recipe.title}</h2>
					<div class="meta">
						<div class="meta-item">
							<span class="icon"><Icon name="sand-clock" /></span>
							<p>{recipe.meta.duration}&nbsp;min</p>
						</div>
						<div class="meta-item">
							<span class="icon"><Icon name={getIconName(recipe.meta.nutritionType)} /></span>
							<p>{recipe.meta.nutritionType}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</a>

<style>
	/*
	 * Typography of the tile, in rem so that it does not depend on the grid.
	 * Roboto is loaded in 100, 400 and 700 only (see +layout.svelte), so no other weights are used.
	 * - category: small and grey, the colored dot carries it
	 * - title: 400, fluid from 1rem on phones to 1.5rem on wide screens, at most two lines
	 * - meta: 400 at 0.8125rem, never below ~13px on phones (the root is 18px there)
	 * The text sits on a gradient instead of a box: without a visible edge it does not
	 * matter whether a title takes one or two lines.
	 */
	a {
		display: block;
		color: inherit;
		text-decoration: none;
	}
	a:focus-visible {
		outline: 3px solid var(--highlight-color, #333);
		outline-offset: -3px;
	}
	.recipe-preview {
		transition: opacity 0.15s;
		overflow: hidden;
	}
	a:hover > .recipe-preview {
		opacity: 0.85;
	}
	.header {
		position: relative;
		height: 40vw;
		min-height: 20rem;
		max-height: 550px;
	}
	.imageWrapper :global(.image) {
		position: absolute;
		height: 100%;
		width: 100%;
		object-fit: cover;
		color: transparent;
	}
	.imageWrapper {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.imagePlaceholder {
		position: absolute;
		background-color: #eee;
		background-size: cover;
		background-position: center;
		filter: blur(8px);
		height: 100%;
		width: 100%;
	}
	.infos {
		position: absolute;
		bottom: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		/* the top padding lets the gradient fade out above the text */
		padding: 3rem 0.9rem 0.8rem;
		background: linear-gradient(
			to top,
			rgb(255 255 255 / 0.96) 0%,
			rgb(255 255 255 / 0.88) 55%,
			rgb(255 255 255 / 0) 100%
		);
		color: #222;
		/* keeps the text legible where the image shines through */
		text-shadow: 0 0 6px rgb(255 255 255 / 0.8);
	}
	.category {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 400;
		line-height: 1.2;
		color: #888;
		display: flex;
		align-items: center;
		gap: 0.4em;
	}
	.category::before {
		content: '';
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: var(--highlight-color);
	}
	.title {
		margin: 0;
		font-size: clamp(1rem, 0.85rem + 1vw, 1.5rem);
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: #222;
		/* two lines instead of cutting long titles after a few words */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: break-word;
		hyphens: auto;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem 0.9rem;
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.4;
		color: #555;
		font-variant-numeric: tabular-nums;
	}
	.meta-item {
		display: flex;
		align-items: center;
	}
	.meta-item p {
		margin: 0;
	}
	.icon {
		display: flex;
		margin-right: 0.35em;
		color: var(--highlight-color);
	}

	/* phones show two columns of portrait tiles */
	@media (max-width: 599px) {
		.header {
			height: auto;
			min-height: 0;
			aspect-ratio: 4 / 5;
		}
		.infos {
			gap: 0.2rem;
			padding: 2.5rem 0.65rem 0.65rem;
		}
		.meta {
			gap: 0.1rem 0.6rem;
			font-size: 0.75rem;
		}
	}
</style>
