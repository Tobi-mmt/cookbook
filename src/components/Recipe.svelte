<script lang="ts">
	import type { Recipe, Section } from '../types';

	import { categoryColors } from '$lib/colors';
	import { getIconName } from '$lib/iconName';
	import { getSourceSet } from '$lib/image';
	import Icon from './Icon.svelte';

	import RecipeStep from './RecipeStep.svelte';
	import WakeLock from './WakeLock.svelte';
	export let recipe: Recipe;

	let portion = recipe.meta.portion;

	const increasePortion = () => {
		portion = portion + 1;
	};

	const reducePortion = () => {
		if (portion > 1) {
			portion = portion - 1;
		}
	};

	const calcQuantity = (quantity: number, portion: number, recipePortion: number) => {
		if (isNaN(quantity)) return quantity;
		const newValue = (quantity * portion) / recipePortion;
		return Number(Math.round(Number(newValue + 'e' + 1)) + 'e-' + 1);
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
	<div itemtype="https://schema.org/Recipe">
		<div class="header">
			<div class="imageWrapper">
				<div
					class="imagePlaceholder"
					style={`background-image: url(${recipe.placeholderImage});`}
				></div>
				<img
					itemprop="image"
					class="image"
					src={recipe.image}
					srcset={getSourceSet(recipe.image)}
					sizes="100vw"
					alt={recipe.title}
				/>
			</div>
			<div class="infos">
				<p class="category">{recipe.meta.category}</p>
				<h1 itemprop="name" class="title">{recipe.title}</h1>
				<div class="meta">
					<div class="meta-item">
						<span class="icon"><Icon name="users-alt-6" /></span>
						<p itemprop="recipeYield">{portion}</p>
					</div>
					<div class="meta-item">
						<span class="icon"><Icon name="sand-clock" /></span>
						<p itemprop="prepTime">{recipe.meta.duration}&nbsp;min</p>
					</div>
					<div class="meta-item">
						<span class="icon"><Icon name={getIconName(recipe.meta.nutritionType)} /></span>
						<p>{recipe.meta.nutritionType}</p>
					</div>
				</div>
			</div>
		</div>
		<div class="content-wrapper">
			{#if recipe.description}
				<p class="description">{recipe.description}</p>
			{/if}
			<div class="content">
				<div class="step">
					<WakeLock />
					<ol class="step--list">
						{#each recipe.steps as step, stepIndex (stepIndex)}
							<li class="step--list-item">
								{#if isSection(step)}
									<span class="step--list-item--decoration step--list-item--decoration_big"
										>{stepIndex + 1}</span
									>
									<h2 class="step--list-item--section">{step.section}</h2>
								{:else}
									<RecipeStep
										{step}
										calcQuantityFunction={(quantety) =>
											calcQuantity(quantety, portion, recipe.meta.portion)}
									/>
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
							{#each recipe.ingredients as ingredient ('section' in ingredient ? ingredient.section : ingredient.name)}
								{#if isSection(ingredient)}
									<tr>
										<td></td>
										<td class="ingredients-headline">{ingredient.section}</td>
									</tr>
								{:else}
									<tr itemprop="recipeIngredient">
										<td>
											{#if ingredient.quantity}
												{calcQuantity(ingredient.quantity, portion, recipe.meta.portion)}
											{/if}
											{#if ingredient.unit}{ingredient.unit}{/if}
										</td>
										<td>
											{#if ingredient.name}{ingredient.name}{/if}
										</td>
									</tr>
								{/if}
							{/each}
							<tr>
								<td colspan="2">
									{#if typeof window !== 'undefined'}
										<a
											class="bring-button"
											href="https://api.getbring.com/rest/bringrecipes/deeplink?url={window.location
												.href}&source=web&baseQuantity={recipe.meta
												.portion}&requestedQuantity={portion}"
											target="_blank"
										>
											<img
												class="bring-logo"
												src="/bring.svg"
												alt="bring! logo"
												width="20"
												height="27"
											/>
											<span>Auf die Einkaufsliste</span>
										</a>
									{/if}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
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
		transition: all 0.2s ease-in-out;
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
	.image {
		position: absolute;
		height: 100%;
		width: 100%;
		object-fit: cover;
		color: transparent;
	}
	.imageWrapper {
		position: relative;
		object-fit: cover;
		position: absolute;
		left: 0;
		right: 0;
		height: 100%;
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
		object-fit: cover;
	}
	.title {
		padding: 0;
		font-weight: 200;
		margin: 0 0 0.25em 0;
		line-height: 1em;
		font-size: 2.5em;
	}
	.description {
		margin-bottom: 2em;
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
	.content-wrapper {
		padding: 2em;
		margin: auto;
		max-width: 1250px;
	}
	.content {
		display: flex;
	}
	.step {
		position: relative;
		padding: 0 2em;
	}
	.step--list {
		padding-left: 0;
	}
	.step--list-item {
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
	.step--list-item--decoration_big {
		font-size: 1em;
		margin-left: -1.95em;
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
		border-left: 1px solid;
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
	.bring-button {
		font-size: 0.9em;
		background: #27343a;
		color: white;
		padding: 0.25em 0.5em;
		border: 0;
		border-radius: 8px;
		box-sizing: border-box;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		height: 100%;
		justify-items: center;
		align-items: center;
		margin: 2em auto 16px;
		min-height: 44px;
		text-decoration: none;
		transition: all 0.2s ease-in-out;
	}
	.bring-button:hover {
		opacity: 0.8;
	}
	.bring-logo {
		margin-right: 1.5em;
		margin-left: 1em;
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
		.title {
			font-size: 2.25em;
		}
	}
</style>
