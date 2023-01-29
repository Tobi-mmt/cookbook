<script lang="ts">
	import type { Recipe, Section } from '../types';

	import { categoryColors } from '../lib/colors';
	import { getIconName } from '../lib/iconName';
	import { useSmallImage } from '$lib/image';
	import Icon from './Icon.svelte';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let recipe: Recipe;

	let portion = recipe.meta.portion;

	onMount(() => {
		if (browser) {
			document.lazyloadInstance.update();
		}
	});

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

	const optionalText = (text?: string | number) => {
		return text ? text : '';
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const isSection = (ingredient: any): ingredient is Section => {
		return Boolean(ingredient.section);
	};
</script>

<section
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
					data-src={useSmallImage(recipe.image, 1500)}
				/>
			</div>
			<div class="infos">
				<p class="category">{recipe.meta.category}</p>
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
			<div class="step">
				<div class="dotted-line" />
				<ol class="step--list">
					{#each recipe.steps as step, stepIndex}
						<li class="step--list-item">
							{#if isSection(step)}
								<span class="step--list-item--decoration step--list-item--decoration_big"
									>{stepIndex + 1}</span
								>
								<h2 class="step--list-item--section">{step.section}</h2>
							{:else}
								<span class="step--list-item--decoration">{stepIndex + 1}</span>
								<span>{step.description}</span>
								<div class="step--list-item--ingredients">
									{#if step?.linkedIngredients}
										{#each step?.linkedIngredients as linkedIngredient, ingredientIndex}
											<span>
												{#if linkedIngredient.quantity}
													{calcQuantity(linkedIngredient.quantity, portion)}
												{/if}
												{optionalText(linkedIngredient.unit)}
												{optionalText(linkedIngredient.name)}
												{#if ingredientIndex < step?.linkedIngredients.length - 1},{/if}
											</span>
										{/each}
									{/if}
								</div>
							{/if}
						</li>
					{/each}
				</ol>
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
	.header {
		min-height: 12cm;
		position: relative;
		background-size: cover;
		background-position: left center;
		height: 40vw;
		max-height: 550px;
	}
	.imageWrapper {
		background-position: center;
		background-size: cover;
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
		margin: 0 0 0.25em 0;
		line-height: 1em;
		font-size: 2.5em;
	}
	.category {
		color: #888;
		font-weight: 300;
	}
	.infos {
		position: absolute;
		bottom: 0em;
		background: #fffd;
		padding: 1em 1.5em;
		width: 100%;
		text-align: center;
	}
	.meta {
		opacity: 0.75;
		display: flex;
		justify-content: center;
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
	.meta-item p {
		margin: 0;
	}
	.content {
		display: flex;
		padding: 2em;
		margin: auto;
		max-width: 1250px;
	}
	.step {
		position: relative;
		padding-right: 2em;
	}
	.step--list {
		padding-left: 1.15em;
	}
	.step--list-item {
		margin-bottom: 1.5em;
		list-style: none;
		position: relative;
	}
	.step--list-item--section {
		font-weight: 500;
		margin-top: 3em;
	}
	.step--list-item:first-child .step--list-item--section {
		margin-top: 0;
	}
	.step--list-item--decoration {
		color: #fff;
		background-color: var(--highlight-color);
		display: inline-block;
		width: 1.75em;
		height: 1.75em;
		font-size: 0.75em;
		margin-left: -2.25em;
		margin-right: 0.15em;
		border-radius: 50%;
		text-align: center;
		padding-top: 0.25em;
		position: absolute;
	}
	.step--list-item--decoration_big {
		font-size: 1em;
		margin-left: -1.95em;
	}
	.step--list-item--ingredients {
		font-size: 0.75em;
		opacity: 0.7;
	}
	.step .dotted-line {
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
		.step--list-item {
			margin-bottom: 1em;
		}
		.title {
			font-size: 2.25em;
		}
	}
</style>
