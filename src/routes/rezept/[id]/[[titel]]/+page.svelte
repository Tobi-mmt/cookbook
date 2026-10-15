<script lang="ts">
	import type { Recipe } from '#types';
	import RecipeComponent from '#components/Recipe.svelte';
	import { page } from '$app/state';
	import { recipePath } from '#lib/paths.js';
	import { SITE_NAME } from '#lib/site.js';

	let { data }: { data: { recipe: Recipe } } = $props();

	const recipe = $derived(data.recipe);
	const description = $derived(
		recipe.description ??
			`${recipe.title} – ein Rezept aus „${recipe.cookbook.name}“ von @${recipe.cookbook.ownerUsername}.`
	);
	const original = $derived(recipe.attribution[0]);
	const canonical = $derived(
		new URL(
			recipe.isUnchangedCopy && original?.exists
				? recipePath({ id: original.recipeId, title: original.title })
				: recipePath(recipe),
			page.url.origin
		).href
	);

	const imageData = $derived.by(() => {
		const image = recipe.image;
		if (!image) return null;

		// social networks recommend ~1200px and often cannot show AVIF, see `WEBP_WIDTH`
		const variants = image.variants.webp;
		const variant = variants.find(({ width }) => width >= 1200) ?? variants[variants.length - 1];

		return {
			url: new URL(variant.url, page.url.origin).href,
			width: variant.width,
			height: Math.round((image.height / image.width) * variant.width)
		};
	});
</script>

<svelte:head>
	<title>{recipe.title} - {SITE_NAME}</title>
	<link rel="canonical" href={canonical} />
	<meta name="description" content={description} />
	{#if recipe.author}<meta name="author" content={recipe.author.name} />{/if}
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={recipe.title} />
	<meta property="og:description" content={description} />
	{#if imageData}
		<meta property="og:image" content={imageData.url} />
		<meta property="og:image:alt" content={recipe.title} />
		<meta property="og:image:width" content={imageData.width.toString()} />
		<meta property="og:image:height" content={imageData.height.toString()} />
	{/if}
</svelte:head>

{#key recipe}
	<RecipeComponent {recipe} />
{/key}
