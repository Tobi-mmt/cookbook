<script lang="ts">
	import Icon from './Icon.svelte';
	import { categoryColors } from '$lib/colors';
	import { slugerize } from '$lib/slugerize';
	import { categorizedRecipes } from '$lib/categorizedRecipes';
	import { goto } from '$app/navigation';

	export let onItemClick: () => void;

	const handleLinkClick = (href: string) => {
		goto(href);
		onItemClick();
	};
</script>

<div class="wrapper">
	{#each Object.entries(categorizedRecipes) as [category, recipies]}
		<div>
			<h3 class="category" style={`background-color: ${categoryColors[category]} `}>{category}</h3>
			<div>
				<ul class="list">
					{#each recipies as recipe}
						<li
							class="list-item"
							on:click={() => handleLinkClick(`/recipe/${recipe.id}/${slugerize(recipe.title)}`)}
							on:keypress={() => handleLinkClick(`/recipe/${recipe.id}/${slugerize(recipe.title)}`)}
						>
							{recipe.title}&nbsp;
							{#if recipe.meta.nutritionType === 'Fleisch'}
								<Icon name="steak" style="color: #AA3C3B" />
							{/if}
							{#if recipe.meta.nutritionType === 'Vegan'}
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
		margin: 1em 0;
	}
	.list-item {
		cursor: pointer;
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
