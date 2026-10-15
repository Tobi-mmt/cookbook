<script lang="ts">
	import type { Ingredient, Recipe, Section } from '../types';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Users from '@lucide/svelte/icons/users';
	import { page } from '$app/state';

	import { nutritionIcons } from '#lib/nutritionIcon.js';
	import { cookbookPath, profilePath, recipePath } from '#lib/paths.js';
	import { imageCaption, licenseUrl } from '#lib/imageLicense.js';
	import RecipeImage from './RecipeImage.svelte';

	import RecipeStep from './RecipeStep.svelte';
	import WakeLock from './WakeLock.svelte';
	let {
		recipe,
		toolbar,
		footer
	}: {
		recipe: Recipe;
		toolbar?: import('svelte').Snippet;
		/** e.g. the link to report the recipe */
		footer?: import('svelte').Snippet;
	} = $props();

	// the recipe page re-creates this component via {#key} for another recipe
	// svelte-ignore state_referenced_locally
	let portion = $state(recipe.meta.portion);
	const NutritionIcon = $derived(nutritionIcons[recipe.meta.nutritionType]);

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

	const isSection = (item: Ingredient | Section | Recipe['steps'][number]): item is Section =>
		'section' in item && Boolean(item.section);

	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', {
			day: 'numeric',
			month: 'short',
			...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {})
		}).format(date);
	const original = $derived(recipe.attribution[0]);
	const caption = $derived(recipe.image && imageCaption(recipe.image));
	const sourceHost = $derived(recipe.sourceUrl && new URL(recipe.sourceUrl).hostname);

	// rendered on the server as well, so that the button does not pop in after loading
	const bringUrl = $derived(
		'https://api.getbring.com/rest/bringrecipes/deeplink?' +
			new URLSearchParams({
				url: page.url.href,
				source: 'web',
				baseQuantity: String(recipe.meta.portion),
				requestedQuantity: String(portion)
			})
	);
</script>

<section
	style={`
  --highlight-color: ${recipe.meta.category.color};
  --highlight-color-light: ${recipe.meta.category.color}77;
  `}
>
	<div itemscope itemtype="https://schema.org/Recipe">
		<div class="header">
			<div class="imageWrapper">
				{#if recipe.image}
					<div
						class="imagePlaceholder"
						style={`background-image: url(${recipe.image.placeholder});`}
					></div>
					<RecipeImage
						class="image"
						image={recipe.image}
						loading="eager"
						sizes="100vw"
						alt={recipe.title}
						fetchpriority="high"
					/>
				{:else}
					<div class="imagePlaceholder"></div>
				{/if}
			</div>
			<div class="infos">
				<div class="labels">
					<p class="category">{recipe.meta.category.name}</p>
					{#if recipe.isNew}<span class="badge">NEU</span>{/if}
				</div>
				<h1 itemprop="name" class="title">{recipe.title}</h1>
				<div class="meta">
					<div class="meta-item">
						<span class="icon"><Users size="1.1em" aria-hidden="true" /></span>
						<p><span class="visually-hidden">Portionen: </span>{portion}</p>
					</div>
					<div class="meta-item">
						<span class="icon"><Hourglass size="1.1em" aria-hidden="true" /></span>
						<p>
							<span class="visually-hidden">Dauer:</span>
							{recipe.meta.duration} min
						</p>
					</div>
					<div class="meta-item">
						<span class="icon"><NutritionIcon size="1.1em" aria-hidden="true" /></span>
						<p>{recipe.meta.nutritionType}</p>
					</div>
				</div>
			</div>
		</div>

		{#if caption}
			<p class="image-caption">
				{caption}{#if recipe.image?.license}
					· <a href={licenseUrl(recipe.image.license)} rel="license">Lizenz</a>{/if}
			</p>
		{/if}
		<div class="content-wrapper">
			{@render toolbar?.()}
			{#if recipe.description}
				<p class="description" itemprop="description">{recipe.description}</p>
			{/if}
			<div class="content">
				<div class="steps">
					<div class="steps-header">
						<h2 class="part-title">Zubereitung</h2>
						<WakeLock />
					</div>
					<ol class="step-list">
						{#each recipe.steps as step, stepIndex (stepIndex + portion)}
							<li class="step-list-item">
								{#if isSection(step)}
									<h3 class="section-title">{step.section}</h3>
								{:else}
									<RecipeStep
										{step}
										calcQuantityFunction={(quantity) =>
											calcQuantity(quantity, portion, recipe.meta.portion)}
									/>
								{/if}
							</li>
						{/each}
					</ol>
				</div>

				<aside class="ingredients">
					<h2 class="part-title">Zutaten</h2>
					<div class="portions">
						<span>Portionen</span>
						<div class="stepper">
							<button
								type="button"
								class="stepper-button"
								onclick={reducePortion}
								disabled={portion <= 1}
								aria-label="Eine Portion weniger"><Minus size="1em" aria-hidden="true" /></button
							>
							<output itemprop="recipeYield" aria-live="polite">{portion}</output>
							<button
								type="button"
								class="stepper-button"
								onclick={increasePortion}
								aria-label="Eine Portion mehr"><Plus size="1em" aria-hidden="true" /></button
							>
						</div>
					</div>

					<ul class="ingredient-list">
						{#each recipe.ingredients as ingredient ('section' in ingredient ? ingredient.section : `${ingredient.key || ingredient.name}-${ingredient.quantity}`)}
							{#if isSection(ingredient)}
								<li class="ingredient-section">{ingredient.section}</li>
							{:else}
								<li class="ingredient" itemprop="recipeIngredient">
									<span class="quantity">
										{#if ingredient.quantity}
											{calcQuantity(ingredient.quantity, portion, recipe.meta.portion)}
										{/if}
										{#if ingredient.unit}{ingredient.unit}{/if}
									</span>
									<span>{ingredient.name}</span>
								</li>
							{/if}
						{/each}
					</ul>

					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
					<a class="bring-button" href={bringUrl} target="_blank" rel="noreferrer">
						<img src="/bring.svg" alt="" width="20" height="27" />
						<span>Auf die Einkaufsliste</span>
					</a>
				</aside>
			</div>

			<footer class="recipe-footer">
				<p>
					In <a href={cookbookPath(recipe.cookbook)}>{recipe.cookbook.name}</a> von
					<a href={profilePath(recipe.cookbook.ownerUsername)}>@{recipe.cookbook.ownerUsername}</a
					>{#if recipe.author}
						· hinzugefügt von <a href={profilePath(recipe.author.username)}>{recipe.author.name}</a
						>{/if}
					· zuletzt geändert {formatDate(recipe.updatedAt)}
				</p>
				{#if original}
					<p>
						Übernommen von
						{#if original.exists}
							<a href={recipePath({ id: original.recipeId, title: original.title })}
								>{original.title}</a
							>
						{:else}
							„{original.title}“ (Original nicht mehr verfügbar)
						{/if}
						{#if original.author}aus dem Kochbuch von
							<a href={profilePath(original.author.username)}>@{original.author.username}</a>{/if}
					</p>
				{/if}
				<p>
					{#if recipe.attribution.length}
						Angepasst von {recipe.author
							? `@${recipe.author.username}`
							: 'einer ehemaligen Person'}{#each recipe.attribution as entry (entry.recipeId)}, nach
							„{entry.title}“ von {entry.author
								? `@${entry.author.username}`
								: 'einer ehemaligen Person'}{/each},
					{:else}
						Rezept von {recipe.author ? `@${recipe.author.username}` : 'einer ehemaligen Person'},
					{/if}
					<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" rel="license"
						>CC BY-SA 4.0</a
					>
				</p>
				{@render footer?.()}
				{#if recipe.sourceUrl}
					<p>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
						Quelle: <a href={recipe.sourceUrl} rel="nofollow noopener noreferrer">{sourceHost}</a>
					</p>
				{/if}
			</footer>
		</div>
	</div>
</section>

<style>
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.icon {
		margin-right: 0.4em;
		display: flex;
		color: var(--highlight-color);
	}

	/* header, same design as the recipe tiles (RecipePreview.svelte) */
	.header {
		position: relative;
		height: 40vw;
		min-height: 24rem;
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
		background-color: var(--color-surface-muted);
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
		align-items: center;
		gap: 0.4rem;
		/* the top padding lets the gradient fade out above the text */
		padding: 5rem 1.5rem 1.25rem;
		text-align: center;
		background: linear-gradient(
			to top,
			rgb(255 255 255 / 0.96) 0%,
			rgb(255 255 255 / 0.88) 55%,
			rgb(255 255 255 / 0) 100%
		);
		/* keeps the text legible where the image shines through */
		text-shadow: 0 0 6px rgb(255 255 255 / 0.8);
	}
	.labels {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	/* marks recipes of the last weeks, see src/lib/newRecipe.ts */
	.badge {
		padding: 0.25em 0.7em;
		font-size: 0.75rem;
		line-height: 1.2;
		color: var(--color-text-muted);
		text-shadow: none;
		/* same look as the filter chips on the home page */
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.category {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.875rem;
		line-height: 1.2;
		color: var(--color-text-subtle);
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
		font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
		font-weight: 400;
		line-height: 1.15;
		letter-spacing: -0.015em;
		color: var(--color-text);
		overflow-wrap: break-word;
		hyphens: auto;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.2rem 1.25rem;
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}
	.meta-item {
		display: flex;
		align-items: center;
	}
	.meta-item p {
		margin: 0;
	}

	/* content */
	.content-wrapper {
		max-width: 1250px;
		margin: auto;
		padding: 2rem;
	}
	.description {
		max-width: 46rem;
		margin: 0 0 2rem;
		line-height: 1.6;
		color: var(--color-text-muted);
	}
	.content {
		display: flex;
		align-items: flex-start;
		gap: 3rem;
	}
	.part-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.steps {
		flex: 1;
		min-width: 0;
	}
	.steps-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.step-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.section-title {
		margin: 2rem 0 0.25rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-subtle);
	}
	.step-list-item:first-child .section-title {
		margin-top: 0;
	}

	/* ingredients stay visible next to the steps on wide screens */
	.ingredients {
		position: sticky;
		top: calc(var(--top-bar-height) + 1rem);
		flex: 0 0 20rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-md);
	}
	.portions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--color-text-muted);
	}
	.stepper {
		display: flex;
		align-items: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.stepper output {
		min-width: 2ch;
		text-align: center;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.stepper-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		color: var(--highlight-color);
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.stepper-button:hover:not(:disabled) {
		background: var(--color-surface-muted);
	}
	.stepper-button:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.ingredient-list {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.ingredient {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 0.75rem;
		line-height: 1.4;
	}
	.quantity {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}
	.ingredient-section {
		margin-top: 0.75rem;
		padding-bottom: 0.25rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-subtle);
		border-bottom: 1px solid var(--color-border);
	}
	.ingredient-section:first-child {
		margin-top: 0;
	}
	.bring-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		min-height: 44px;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		color: #fff;
		text-decoration: none;
		background: var(--color-dark);
		border-radius: var(--radius-md);
		transition: opacity 0.2s ease-in-out;
	}
	.bring-button:hover {
		opacity: 0.85;
	}

	.image-caption {
		max-width: 1250px;
		margin: 0.4rem auto 0;
		padding: 0 2rem;
		text-align: right;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}
	.image-caption a {
		color: inherit;
	}
	.recipe-footer {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 3rem;
		padding-top: 1.25rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--color-text-subtle);
		border-top: 1px solid var(--color-border);
	}
	.recipe-footer p {
		margin: 0;
	}
	.recipe-footer a {
		color: var(--color-text-muted);
	}

	@media (max-width: 700px) {
		.header {
			height: auto;
			min-height: 0;
			aspect-ratio: 4 / 3;
		}
		.infos {
			padding: 3.5rem 1rem 1rem;
		}
		.meta {
			gap: 0.15rem 0.9rem;
			font-size: 0.8125rem;
		}
		.content-wrapper {
			padding: 1.25rem 1rem 2rem;
		}
		.description {
			margin-bottom: 1.25rem;
		}
		.content {
			flex-direction: column-reverse;
			align-items: stretch;
			gap: 2rem;
		}
		.ingredients {
			position: static;
			flex-basis: auto;
		}
	}
</style>
