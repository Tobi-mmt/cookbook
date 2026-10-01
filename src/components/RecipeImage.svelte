<script lang="ts">
	import type { RecipeImage } from '$types';

	export let image: RecipeImage;
	export let alt: string;
	export let sizes: string;
	export let loading: 'eager' | 'lazy' = 'lazy';
	export let fetchpriority: 'high' | 'low' | 'auto' = 'auto';
	let className = '';
	export { className as class };

	const srcset = (variants: RecipeImage['variants'][keyof RecipeImage['variants']]) =>
		variants.map(({ url, width }) => `${url} ${width}w`).join(', ');

	$: fallback = image.variants.webp[image.variants.webp.length - 1];
</script>

<picture>
	<source type="image/avif" srcset={srcset(image.variants.avif)} {sizes} />
	<source type="image/webp" srcset={srcset(image.variants.webp)} {sizes} />
	<img
		class={className}
		src={fallback.url}
		{alt}
		{loading}
		{fetchpriority}
		width={image.width}
		height={image.height}
		itemprop="image"
	/>
</picture>
