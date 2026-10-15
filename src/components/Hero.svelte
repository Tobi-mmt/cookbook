<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { resolve } from '$app/paths';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import Users from '@lucide/svelte/icons/users';
	import RecipeImage from '#components/RecipeImage.svelte';

	let { recipes, discoverHref }: { recipes: RecipeSummary[]; discoverHref: string } = $props();

	// the photos of the page are its best advertisement, one on phones, three side by side above
	const photos = $derived(recipes.filter((recipe) => recipe.image).slice(0, 3));
</script>

<!-- only for guests, html.signed-in hides it before the first paint (see app.html) -->
<section class="hero" aria-labelledby="hero-title">
	<div class="photos" aria-hidden="true">
		{#each photos as recipe, index (recipe.id)}
			{#if recipe.image}
				<div class="photo" style="background-image: url({recipe.image.placeholder})">
					<RecipeImage
						class="hero-image"
						image={recipe.image}
						alt=""
						sizes="(min-width: 600px) 34vw, 100vw"
						loading={index === 0 ? 'eager' : 'lazy'}
						fetchpriority={index === 0 ? 'high' : 'auto'}
					/>
				</div>
			{/if}
		{/each}
	</div>

	<div class="content">
		<p class="eyebrow">Für alle, die gern kochen</p>
		<h1 id="hero-title">Deine Lieblingsrezepte. Endlich an einem Ort.</h1>
		<p class="lead">
			Schluss mit Zetteln, Screenshots und Lesezeichen: Speichere deine Rezepte digital, sammle sie
			in Kochbüchern und koche gemeinsam mit Familie und Freunden daraus.
		</p>
		<ul class="points">
			<li><NotebookPen size="1em" aria-hidden="true" /> Rezepte speichern</li>
			<li><BookOpen size="1em" aria-hidden="true" /> In Kochbüchern sammeln</li>
			<li><Users size="1em" aria-hidden="true" /> Gemeinsam pflegen</li>
		</ul>
		<div class="actions">
			<a class="btn cta" href={resolve('/anmelden')}>Eigenes Kochbuch anlegen</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a class="btn btn--quiet more" href={discoverHref}>Rezepte entdecken</a>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		display: flex;
		align-items: flex-end;
		height: 50vh;
		height: 50svh;
		min-height: 24rem;
		overflow: hidden;
		color: #fff;
		background: var(--color-dark);
	}
	:global(html.signed-in) .hero {
		display: none;
	}
	.photos {
		position: absolute;
		inset: 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 2px;
	}
	.photo {
		position: relative;
		background-size: cover;
		background-position: center;
	}
	.photo :global(.hero-image) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* the text needs a calm, dark ground, the photos stay visible above it */
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.35) 55%, rgb(0 0 0 / 0.1)),
			linear-gradient(to right, rgb(0 0 0 / 0.45), transparent 70%);
	}
	.content {
		position: relative;
		z-index: 1;
		max-width: 40rem;
		padding: 2.5rem 3rem;
	}
	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.75rem, 4vw, 3rem);
		font-weight: 400;
		line-height: 1.1;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	.lead {
		margin: 0.85rem 0 0;
		font-size: 1.0625rem;
		line-height: 1.5;
		opacity: 0.92;
	}
	.points {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		margin: 1rem 0 0;
		padding: 0;
		font-size: 0.875rem;
		list-style: none;
		opacity: 0.9;
	}
	.points li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	.cta {
		color: var(--color-dark);
		background: #fff;
		border-color: #fff;
	}
	.cta:hover {
		background: rgb(255 255 255 / 0.88);
		border-color: transparent;
	}
	.more {
		color: #fff;
	}
	.more:hover {
		background: rgb(255 255 255 / 0.15);
	}
	@media (max-width: 599px) {
		.photo:not(:first-child) {
			display: none;
		}
		.content {
			padding: 1.5rem 1rem;
		}
		.lead {
			font-size: 1rem;
		}
		.points {
			display: none;
		}
	}
</style>
