<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import LandingLinks from '#components/LandingLinks.svelte';
	import SearchField from '#components/SearchField.svelte';
	import type { Landing } from '#lib/landings.js';
	import { SITE_NAME } from '#lib/site.js';

	let { data }: { data: { landings: Landing[] } } = $props();

	const description = `Rezepte nach Kategorie und Ernährung: vegan, vegetarisch, Hauptgerichte, Desserts und mehr, gesammelt in den Kochbüchern der ${SITE_NAME}.`;
</script>

<svelte:head>
	<title>Rezepte nach Kategorie - {SITE_NAME}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Rezepte nach Kategorie" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
	<link rel="canonical" href="{page.url.origin}/rezepte" />
</svelte:head>

<div class="page">
	<h1>Rezepte nach Kategorie</h1>
	<p class="lead">
		Alle Rezepte der {SITE_NAME} stammen aus Kochbüchern von Menschen, die gern kochen. Such dir eine
		Kategorie aus oder durchsuche alle Rezepte.
	</p>
	{#if data.landings.length}
		<LandingLinks landings={data.landings} />
	{:else}
		<p class="hint">Hier erscheinen bald die ersten Rezepte.</p>
	{/if}
	<SearchField action={resolve('/suche')} placeholder="Alle Rezepte durchsuchen" />
</div>

<style>
	h1 {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 400;
	}
	.lead {
		margin: 0 0 1.5rem;
		line-height: 1.6;
		color: var(--color-text-muted);
	}
</style>
