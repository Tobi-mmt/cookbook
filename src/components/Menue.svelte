<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import { categoryColors } from '$lib/colors';
	import { slugerize } from '$lib/slugerize';
	import { categorizedRecipes } from '$lib/categorizedRecipes';
	import { resolve } from '$app/paths';

	export let onItemClick: () => void;
</script>

<div class="wrapper">
	{#each Object.entries(categorizedRecipes) as [category, recipies] (category)}
		<div>
			<h3 class="category" style={`background-color: ${categoryColors[category]} `}>{category}</h3>
			<div>
				<nav class="list">
					{#each recipies as recipe (recipe.id)}
						<a
							role="button"
							tabindex="0"
							class="list-item"
							href={resolve(`/recipe/[recipeId]/[recipeTitle]`, {
								recipeId: recipe.id,
								recipeTitle: slugerize(recipe.title)
							})}
							on:click={onItemClick}
							on:keypress={onItemClick}
						>
							{recipe.title}&nbsp;
							{#if recipe.meta.nutritionType === 'Fleisch'}
								<Icon name="steak" style="color: #AA3C3B" />
							{/if}
							{#if recipe.meta.nutritionType === 'Vegan'}
								<Icon name="leaf" style="color: #4CAF50" />
							{/if}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	{/each}
</div>

<style>
	.wrapper {
		padding-bottom: 3.5em;
		display: flex;
		flex-direction: column;
	}
	.category {
		position: sticky;
		top: 0;
		color: #fff;
		padding: 0.75em 1.71em;
		margin: 0;
	}
	.list {
		padding: 0 2em;
		margin: 1em 0;
	}
	.list-item {
		display: block;
		width: 100%;
		text-decoration: none;
		list-style: none;
		line-height: 1.5em;
		font-size: 1.125em;
		transition: color 0.25s;
		color: #777;
	}
	.list-item:hover,
	.list-item:focus {
		color: #000;
	}
	@media only screen and (max-width: 800px) {
		.category {
			padding: 0.75em 0.88em;
		}
		.list {
			padding: 0 1em;
		}
		.list-item {
			line-height: 1.7em;
		}
	}
</style>
