<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import LandingLinks from '#components/LandingLinks.svelte';
	import PlatformPitch from '#components/PlatformPitch.svelte';
	import SearchField from '#components/SearchField.svelte';
	import type { Landing } from '#lib/landings.js';
	import { SITE_NAME } from '#lib/site.js';

	let { data }: { data: { landings: Landing[]; ingredients: Landing[] } } = $props();

	const categories = $derived(data.landings.filter(({ kind }) => kind === 'category'));
	const diets = $derived(data.landings.filter(({ kind }) => kind === 'diet'));
	const total = $derived(categories.reduce((sum, { count }) => sum + count, 0));
	const description = `Rezepte nach Kategorie, Ernährung und Zutat: vegan, vegetarisch, Hauptgerichte, Desserts und mehr aus echten Familienkochbüchern. Kostenlos eigene Kochbücher anlegen und mit Freunden teilen.`;
</script>

<svelte:head>
	<title>Rezepte nach Kategorie und Zutat - {SITE_NAME}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Rezepte nach Kategorie und Zutat" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
	<link rel="canonical" href="{page.url.origin}/rezepte" />
</svelte:head>

<div class="page">
	<h1>Rezepte nach Kategorie und Zutat</h1>
	<p class="lead">
		Alle Rezepte der {SITE_NAME} stammen aus Kochbüchern von Menschen, die gern kochen. Such dir eine
		Kategorie, eine Ernährungsform oder eine Zutat aus, die du gerade da hast.
	</p>

	<PlatformPitch />

	{#if data.landings.length}
		{#if categories.length}
			<h2>Kategorien</h2>
			<LandingLinks landings={categories} />
		{/if}
		{#if diets.length}
			<h2>Ernährung</h2>
			<LandingLinks landings={diets} />
		{/if}
		{#if data.ingredients.length}
			<h2>Zutaten</h2>
			<LandingLinks landings={data.ingredients} />
		{/if}
	{:else}
		<p class="hint">Hier erscheinen bald die ersten Rezepte.</p>
	{/if}

	<SearchField action={resolve('/suche')} placeholder="Alle Rezepte durchsuchen" />

	<section class="text">
		<h2>Rezepte sammeln, nachkochen und teilen</h2>
		<p>
			Die {SITE_NAME} ist für alle, die gern kochen und ihre Lieblingsrezepte nicht mehr auf Zetteln,
			in Screenshots und Lesezeichen suchen wollen. {#if total}Gerade findest du hier {total}
				{total === 1 ? 'Rezept' : 'Rezepte'}, sortiert nach Kategorie, Ernährung und Zutat.{/if}
			Jedes stammt aus einem echten Kochbuch: das Lieblingsgericht der Kinder, Omas Kuchen oder der Eintopf,
			der jede Woche auf den Tisch kommt.
		</p>
		<p>
			Mit einem kostenlosen Konto legst du deine eigenen Kochbücher an, übernimmst Rezepte anderer
			mit einem Klick, importierst Rezepte aus Links und lädst Familie und Freunde ein, gemeinsam
			daran zu arbeiten. Alles ohne Werbung und ohne Abo.
		</p>
		<p>
			<a href={resolve('/anmelden')}>Kostenlos ein Kochbuch anlegen</a> ·
			<a href={resolve('/ueber')}>Mehr über die {SITE_NAME}</a>
		</p>
	</section>
</div>

<style>
	h1 {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 400;
	}
	h2 {
		margin: 1.75rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 400;
	}
	.lead {
		margin: 0 0 1.5rem;
		line-height: 1.6;
		color: var(--color-text-muted);
	}
	.text {
		margin-top: 2.5rem;
	}
	.text p {
		margin: 0 0 0.85rem;
		line-height: 1.65;
		color: var(--color-text-muted);
	}
	.text a {
		color: var(--color-text);
	}
	.page :global(.pitch) {
		margin-left: 0;
		margin-right: 0;
	}
</style>
