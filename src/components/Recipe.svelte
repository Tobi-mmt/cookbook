<script lang="ts">
	import type { Recipe, Section, IconName, NutritionType } from '../types';

	import { slugerize } from '../lib/slugerize';
	import { categoryColors } from '../lib/colors';
	import Icon from './Icon.svelte';
	import IntersectionObserver from '../components/IntersectionObserver.svelte';

	export let recipe: Recipe;

	let portion = recipe.meta.portion;

	const getIconName = (nutritionType: NutritionType): IconName => {
		if (nutritionType === 'Vegan') return 'leaf';
		if (nutritionType === 'Fleisch') return 'steak';
		if (nutritionType === 'Vegetarisch') return 'leaf';
	};

	const increasePortion = () => {
		portion = portion + 1;
	};

	const reducePortion = () => {
		if (portion > 1) {
			portion = portion - 1;
		}
	};

	const calcQuantity = (quantity: number, portion: number) => {
		if (isNaN(quantity)) return quantity;
		const newValue = (quantity * portion) / recipe.meta.portion;
		return Number(Math.round(Number(newValue + 'e' + 1)) + 'e-' + 1);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const isSection = (ingredient: any): ingredient is Section => {
		return Boolean(ingredient.section);
	};
</script>

<section
	id={slugerize(recipe.title)}
	class="recipe"
	style={`
  --highlight-color: ${categoryColors[recipe.meta.category]};
  --highlight-color-light: ${categoryColors[recipe.meta.category]}77;
  `}
>
	<div class="header">
		<IntersectionObserver once={true} let:intersecting>
			<div
				class="image"
				style={`background-image: url('${recipe.image}');`}
				role="img"
				aria-label={recipe.title}
			/>
		</IntersectionObserver>
		<div class="infos">
			<h1 class="title">{recipe.title}</h1>
			<div class="meta">
				<div class="meta-item">
					<span class="icon"><Icon name="users-alt-6" /></span>
					<p>{portion}</p>
				</div>
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
	<div class="content">
		<div class="description">
			<div class="dotted-line" />
			<ul class="description--list">
				{#each recipe.description as description}
					<li class="description--list-item">{description}</li>
				{/each}
			</ul>
		</div>
		<div class="ingredients">
			<table>
				<tbody>
					<tr class="portion-settings--wrapper">
						<td class="portion-label">
							<p>Portionen</p>
						</td>
						<td>
							<div class="portion-settings">
								<button
									class="icon-button"
									on:click={reducePortion}
									aria-label="Eine Portion weniger"><Icon name="minus" /></button
								>
								<p>{portion}</p>
								<button
									class="icon-button"
									on:click={increasePortion}
									aria-label="Eine Portion mehr"><Icon name="plus" /></button
								>
							</div>
						</td>
					</tr>
					{#each recipe.ingredients as ingredient}
						<tr>
							{#if isSection(ingredient)}
								<td />
								<td class="ingredients-headline">{ingredient.section}</td>
							{:else}
								<td>
									{#if ingredient.quantity}
										{calcQuantity(ingredient.quantity, portion)}
									{/if}
									{#if ingredient.unit}{ingredient.unit}{/if}
								</td>
								<td>
									{#if ingredient.name}{ingredient.name}{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<style>
	.icon {
		margin-right: 0.4em;
		display: flex;
		color: var(--highlight-color);
	}
	.icon-button {
		background: var(--highlight-color);
		cursor: pointer;
		color: #fff;
		outline: none;
		border: none;
		padding: 0.35em 0.5em;
		border-radius: 2.5px;
	}
	.icon-button:hover,
	.icon-button:focus {
		opacity: 0.7;
	}
	.recipe {
		box-shadow: 0 0 25px #0005;
		margin: 5em 1.5em;
	}
	.recipe:first-of-type {
		margin-top: 2em;
	}
	.header {
		min-height: 12cm;
		position: relative;
		background-size: cover;
		background-position: left center;
		height: 40vw;
		max-height: 550px;
	}
	.image {
		background-position: center;
		background-size: cover;
		position: absolute;
		left: 0;
		right: 0;
		height: 100%;
		overflow: hidden;
	}
	.title {
		padding: 0;
		font-weight: 200;
		margin: 0 0 0.25em 0;
		line-height: 1em;
		font-size: 2.5em;
	}
	.infos {
		position: absolute;
		bottom: 3em;
		background: #fffd;
		padding: 1em 1em 1em 3em;
		overflow: hidden;
		max-width: 100%;
	}
	.meta {
		opacity: 0.75;
		display: flex;
	}
	.meta-item {
		color: #333;
		display: flex;
		align-items: center;
	}
	.meta-item p {
		margin: 0 1em 0 0.25em;
	}
	.meta-item {
		margin: 0 1em 0 0;
	}
	.content {
		display: flex;
		padding: 2em;
	}
	.description {
		position: relative;
		padding-right: 2em;
	}
	.description--list {
		padding-left: 1.15em;
	}
	.description--list-item {
		margin-bottom: 0.5em;
		list-style: none;
	}
	.description--list-item::before {
		content: '•';
		color: var(--highlight-color);
		display: inline-block;
		width: 0.7em;
		height: 1em;
		font-size: 2em;
		margin-left: -0.7em;
	}
	.description .dotted-line {
		border-left: 3px dotted;
		border-color: var(--highlight-color-light);
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
	}
	.ingredients-headline {
		font-weight: bold;
		font-style: italic;
		padding-top: 1em;
	}
	table tr:first-of-type .ingredients-headline {
		padding-top: 0;
	}
	table tr td:first-of-type {
		text-align: right;
		padding-right: 0.5em;
		width: 100px;
	}
	.ingredients {
		padding: 0 1em;
		border-left: 3px dotted;
		border-color: var(--highlight-color-light);
		min-width: 20em;
		margin-bottom: 2em;
	}
	.ingredients .portion-settings--wrapper {
		font-size: 1em;
		height: 3em;
	}
	.ingredients .portion-settings {
		display: flex;
		justify-content: left;
		align-items: center;
	}
	.ingredients .portion-label p {
		margin: 0;
	}
	.ingredients .portion-settings p {
		margin: 0 0.75em;
	}
	.ingredients table {
		margin: 0 auto;
	}
	.ingredients td {
		vertical-align: top;
		width: 200px;
	}
	@media (max-width: 700px) {
		.content {
			flex-direction: column-reverse;
			padding: 2em 1em;
		}
		.ingredients {
			border: none;
			padding-bottom: 1.5em;
			margin-bottom: 1em;
		}
		.description--list-item {
			margin-bottom: 1em;
		}
		.recipe {
			margin: 5em 0;
		}
		.infos {
			bottom: 1.5em;
			padding: 1em;
		}
	}
	@media print {
		.ingredients {
			min-width: 15em;
		}
		.header {
			height: 8cm;
			max-height: unset;
			min-height: unset;
		}
		.recipe {
			margin: 5em 1.5em;
			break-before: page;
			box-shadow: 0 0 5px #0002;
		}
	}
</style>
