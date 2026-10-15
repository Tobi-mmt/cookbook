<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { resolve } from '$app/paths';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import Users from '@lucide/svelte/icons/users';
	import RecipeImage from '#components/RecipeImage.svelte';

	let { recipes, discoverHref }: { recipes: RecipeSummary[]; discoverHref: string } = $props();

	// the photos of the page are its best advertisement and its only color
	const photos = $derived(recipes.filter((recipe) => recipe.image).slice(0, 3));
</script>

<!-- only for guests, html.signed-in hides it before the first paint (see app.html) -->
<section class="hero" class:hero--text-only={!photos.length} aria-labelledby="hero-title">
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
			<a class="btn btn--primary" href={resolve('/anmelden')}>Eigenes Kochbuch anlegen</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a class="btn" href={discoverHref}>Rezepte entdecken</a>
		</div>
	</div>

	{#if photos.length}
		<div class="photos" aria-hidden="true">
			{#each photos as recipe, index (recipe.id)}
				{#if recipe.image}
					<div class="photo" style="background-image: url({recipe.image.placeholder})">
						<RecipeImage
							class="hero-image"
							image={recipe.image}
							alt=""
							sizes={index === 0
								? '(min-width: 900px) 30vw, 34vw'
								: '(min-width: 900px) 20vw, 34vw'}
							loading={index === 0 ? 'eager' : 'lazy'}
							fetchpriority={index === 0 ? 'high' : 'auto'}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</section>

<style>
	/* white like the rest of the page, the photos are shown as they are */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		align-items: center;
		gap: 3rem;
		/* the next part of the page stays in sight below */
		height: 75vh;
		height: 75svh;
		min-height: 30rem;
		max-height: 52rem;
		padding: 2rem 3rem;
	}
	:global(html.signed-in) .hero {
		display: none;
	}
	.hero--text-only {
		grid-template-columns: minmax(0, 40rem);
		justify-content: center;
		height: auto;
		min-height: 0;
	}
	.content {
		max-width: 34rem;
		justify-self: end;
	}
	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-subtle);
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
		color: var(--color-text-muted);
	}
	.points {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		margin: 1rem 0 0;
		padding: 0;
		font-size: 0.875rem;
		list-style: none;
		color: var(--color-text-muted);
	}
	.points li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.points :global(svg) {
		color: var(--color-text-subtle);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	/* one large photo, two small ones beside it */
	.photos {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
		height: 100%;
		max-height: 34rem;
	}
	.photo {
		position: relative;
		overflow: hidden;
		background-size: cover;
		background-position: center;
		background-color: var(--color-surface-muted);
		border-radius: var(--radius-md);
	}
	.photo:first-child {
		grid-row: span 2;
	}
	.photos:has(.photo:only-child) {
		grid-template-columns: 1fr;
	}
	.photo:nth-child(2):last-child {
		grid-row: span 2;
	}
	.photo :global(.hero-image) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			align-items: stretch;
			gap: 1.5rem;
			min-height: 34rem;
			padding: 1.5rem;
		}
		.content {
			justify-self: start;
			max-width: 40rem;
		}
		.photos {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			grid-template-rows: minmax(0, 1fr);
			max-height: none;
		}
		.photo:first-child,
		.photo:nth-child(2):last-child {
			grid-row: auto;
		}
		.photos:has(.photo:nth-child(2):last-child) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 599px) {
		.hero {
			padding: 1.25rem 1rem 1rem;
		}
		.lead {
			font-size: 1rem;
		}
		.points {
			display: none;
		}
	}
</style>
