<script lang="ts">
	import type { Recipe } from '$types';
	import RecipeComponent from '$components/Recipe.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	export let data: { recipe: Recipe };

	$: imageData = (() => {
		if (!data.recipe?.image) return null;

		const image = data.recipe.image as { img?: { src: string; w?: number; h?: number } };

		// Check if image is an object with img property
		if (!image || typeof image !== 'object' || !image.img?.src) {
			return null;
		}

		const img = image.img;
		let imagePath = img.src;

		// Add file extension if missing (enhanced images don't have extensions in the URL)
		if (!imagePath.match(/\.(webp|png|jpg|jpeg|gif|svg)$/i)) {
			imagePath = `${imagePath}.png`;
		}

		// Construct absolute URL
		const imageUrl = imagePath.startsWith('http')
			? imagePath
			: `${$page.url.origin}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;

		return {
			url: imageUrl,
			width: img.w || null,
			height: img.h || null
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
