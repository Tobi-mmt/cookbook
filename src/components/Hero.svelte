<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { resolve } from '$app/paths';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import Users from '@lucide/svelte/icons/users';
	import RecipePreview from '#components/RecipePreview.svelte';

	let { recipes, discoverHref }: { recipes: RecipeSummary[]; discoverHref: string } = $props();

	// the recipes of the page are its best advertisement and its only color
	const tiles = $derived(recipes.filter((recipe) => recipe.image).slice(0, 3));
</script>

<!-- only for guests, html.signed-in hides it before the first paint (see app.html) -->
<section class="hero" class:hero--text-only={!tiles.length} aria-labelledby="hero-title">
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
			<a class="btn discover" href={discoverHref}>Rezepte entdecken</a>
		</div>
	</div>

	{#if tiles.length}
		<div class="tiles">
			{#each tiles as recipe, index (recipe.id)}
				<div class="tile">
					<RecipePreview
						{recipe}
						fill
						priority={index === 0}
						sizes={index === 0 ? '30vw' : '20vw'}
					/>
				</div>
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
	/* one large tile, two half as high beside it */
	.tiles {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
		height: 100%;
		max-height: 34rem;
	}
	.tile {
		min-height: 0;
		overflow: hidden;
		border-radius: var(--radius-md);
	}
	.tile:first-child,
	.tile:nth-child(2):last-child {
		grid-row: span 2;
	}
	.tiles:has(.tile:only-child) {
		grid-template-columns: 1fr;
	}
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			align-items: stretch;
			gap: 1.5rem;
			min-height: 36rem;
			padding: 1.5rem;
		}
		.content {
			justify-self: start;
			max-width: 40rem;
		}
		.tiles {
			max-height: none;
		}
	}
	@media (max-width: 599px) {
		/* on phones only the text, the recipes of the page follow right below */
		.hero {
			height: auto;
			min-height: 0;
			padding: 1.25rem 1rem 0.5rem;
		}
		.lead {
			font-size: 1rem;
		}
		.points {
			display: none;
		}
		.tiles,
		.discover {
			display: none;
		}
	}
</style>
