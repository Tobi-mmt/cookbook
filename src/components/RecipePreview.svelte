<script lang="ts">
	import type { Recipe } from '../types';

	import { slugerize } from '$lib/slugerize';
	import { categoryColors } from '$lib/colors';
	import { getIconName } from '$lib/iconName';
	import Icon from './Icon.svelte';
	import { useSmallImage } from '$lib/image';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let recipe: Recipe;

	onMount(() => {
		if (browser) {
			document.lazyloadInstance.update();
		}
	});
</script>

<a href={`/recipe/${recipe.id}/${slugerize(recipe.title)}`}>
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
				<div class="imageWrapper" style="background-color: #eee">
					<img
						class="lazy"
						src={recipe.placeholderImage}
						alt={recipe.title}
						data-src={useSmallImage(recipe.image)}
					/>
				</div>
				<div class="infos">
					<p class="category">{recipe.meta.category}</p>
					<h1 class="title">{recipe.title}</h1>
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
	.icon {
		margin-right: 0.4em;
		display: flex;
		color: var(--highlight-color);
	}
	.recipe-preview {
		box-shadow: 5px 5px 15px #0003;
		transition: box-shadow 0.25s;
		border-radius: 5px;
		overflow: hidden;
	}
	a:hover > .recipe-preview {
		box-shadow: 5px 5px 15px #0005;
	}
	.header {
		min-height: 20em;
		position: relative;
		background-size: cover;
		background-position: left center;
		height: 40vw;
		max-height: 550px;
	}
	.imageWrapper {
		object-fit: cover;
		position: absolute;
		left: 0;
		right: 0;
		height: 100%;
		overflow: hidden;
	}
	.imageWrapper img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}
	.title {
		padding: 0;
		font-weight: 200;
		margin: 0 0 0.5em 0;
		line-height: 1em;
		font-size: 2.15em;
		color: #333;
	}
	.category {
		color: #333;
		font-weight: 300;
	}
	.infos {
		position: absolute;
		bottom: 0;
		background: #fffd;
		padding: 1em 1.5em;
		overflow: hidden;
		width: 100%;
	}
	.meta {
		opacity: 0.75;
		display: flex;
	}
	.meta-item {
		color: #333;
		display: flex;
		align-items: center;
		margin: 0 1em 0 0;
	}
	.meta-item:last-of-type {
		margin: 0;
	}

	@media (max-width: 700px) {
		.title {
			font-size: 2em;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
