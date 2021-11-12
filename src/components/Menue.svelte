<script lang="ts">
	import Icon from './Icon.svelte';
	import { categoryColors } from '../lib/colors';
	import { slugerize } from '../lib/slugerize';
	import { categorizedRecipe } from '../lib/categorizedRecipes';
	import { goto } from '$app/navigation';

	export let onItemClick: () => void;

	const handleLinkClick = (href: string) => {
		goto(href);
		onItemClick();
	};
</script>

<div class="wrapper">
	{#each Object.entries(categorizedRecipe) as [category, recipies]}
		<div>
			<h3 class="category" style={`background-color: ${categoryColors[category]} `}>{category}</h3>
			<div>
				<ul class="list">
					{#each recipies as recipe}
						<li class="list-item" on:click={() => handleLinkClick(`/#${slugerize(recipe.title)}`)}>
							{recipe.title}&nbsp;
							{#if !recipe.meta.vegetarian && !recipe.meta.vegan}
								<Icon name="steak" style="color: #AA3C3B" />
							{/if}
							{#if recipe.meta.vegan}
								<Icon name="leaf" style="color: #4CAF50" />
							{/if}
						</li>
					{/each}
				</ul>
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
	}
	.list-item {
		cursor: pointer;
		list-style: none;
		line-height: 1.5em;
		font-size: 1.125em;
	}
	.list-item:hover {
		list-style: disclosure-closed;
	}
	@media only screen and (max-width: 800px) {
		.list-item {
			line-height: 1.7em;
		}
	}
</style>
