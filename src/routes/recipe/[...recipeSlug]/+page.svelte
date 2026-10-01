<script lang="ts">
	import type { Recipe } from '$types';
	import RecipeComponent from '$components/Recipe.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	export let data: { recipe: Recipe | null };

	$: imageData = (() => {
		const image = data.recipe?.image;
		if (!image) return null;

		// social networks recommend ~1200px, the 1600px variant is the closest one
		const variants = image.variants.webp;
		const variant = variants.find(({ width }) => width >= 1200) ?? variants[variants.length - 1];

		return {
			url: new URL(variant.url, $page.url.origin).href,
			width: variant.width,
			height: Math.round((image.height / image.width) * variant.width)
		};
	})();
</script>

<svelte:head>
	<meta property="og:site_name" content="Unser Kochbuch" />
	{#if data.recipe}
		<title>{data.recipe.title && `${data.recipe.title} - `} Unser Kochbuch</title>
		<meta name="author" content="Tobias & Mona" />
		<meta property="og:title" content={data.recipe.title} />
		{#if data.recipe.description}
			<meta property="og:description" content={data.recipe.description} />
		{/if}
		{#if imageData}
			<meta property="og:image" content={imageData.url} />
			<meta property="og:image:secure_url" content={imageData.url} />
			<meta property="og:image:alt" content={data.recipe.title} />
			{#if imageData.width}
				<meta property="og:image:width" content={imageData.width.toString()} />
			{/if}
			{#if imageData.height}
				<meta property="og:image:height" content={imageData.height.toString()} />
			{/if}
		{/if}

		<meta property="og:type" content="article" />

		{#if data.recipe.description}
			<meta name="description" content={data.recipe.description} />
			<meta name="og:description" content={data.recipe.description} />
		{:else}
			<meta
				name="description"
				content="Eines unsere Liebelingsrezepte, die wir über die Jahre angesammelt haben."
			/>
			<meta
				name="og:description"
				content="Eines unsere Liebelingsrezepte, die wir über die Jahre angesammelt haben."
			/>
		{/if}
	{/if}
</svelte:head>

{#if data.recipe}
	{#key data.recipe}
		<RecipeComponent recipe={data.recipe} />
	{/key}
{:else}
	<h1>Kein Rezept gefunden</h1>
	<p>
		Gehe zur <a href={resolve('/', {})}>Übersicht</a> oder benutze die Suche, um ein Rezept zu finden.
	</p>
{/if}
