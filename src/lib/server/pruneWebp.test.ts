import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../types';
import { pruneWebpVariants } from './pruneWebp';

describe('pruneWebpVariants', () => {
	const variants = (widths: number[], format: string) =>
		widths.map((width) => ({ width, url: `/blob/${width}.${format}` }));
	const image = (webpWidths: number[]): RecipeImage => ({
		width: 3000,
		height: 2000,
		placeholder: '',
		variants: { avif: variants([480, 960], 'avif'), webp: variants(webpWidths, 'webp') }
	});

	test('keeps the smallest WebP that is wide enough for social networks', () => {
		const { image: pruned, removed } = pruneWebpVariants(image([480, 960, 1600, 2400]));

		expect(pruned.variants.webp).toEqual([{ width: 1600, url: '/blob/1600.webp' }]);
		expect(pruned.variants.avif).toHaveLength(2);
		expect(removed).toEqual(['/blob/480.webp', '/blob/960.webp', '/blob/2400.webp']);
	});

	test('keeps the largest WebP of small images', () => {
		const { image: pruned, removed } = pruneWebpVariants(image([480, 800]));

		expect(pruned.variants.webp).toEqual([{ width: 800, url: '/blob/800.webp' }]);
		expect(removed).toEqual(['/blob/480.webp']);
	});

	test('leaves images with a single WebP alone', () => {
		expect(pruneWebpVariants(image([1200])).removed).toEqual([]);
	});
});
