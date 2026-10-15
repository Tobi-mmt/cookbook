import sharp from 'sharp';
import { describe, expect, test } from 'vitest';
import { processAndStoreImage } from './images';
import type { Storage } from './storage';

const memoryStorage = (): Storage => ({
	putFile: async (pathname) => `/blob/${pathname}`,
	deleteFiles: async () => {}
});

const createImage = (width: number, height: number) =>
	sharp({ create: { width, height, channels: 3, background: '#c84' } })
		.jpeg()
		.toBuffer();

describe('processAndStoreImage', () => {
	test('creates AVIF in all widths and a single WebP', async () => {
		const image = await processAndStoreImage(await createImage(3000, 2000), 'a', memoryStorage());

		expect(image.variants.avif.map(({ width }) => width)).toEqual([480, 960, 1600, 2400]);
		expect(image.variants.webp.map(({ width }) => width)).toEqual([1200]);
	});

	test('never scales small images up', async () => {
		const image = await processAndStoreImage(await createImage(800, 600), 'a', memoryStorage());

		expect(image.variants.avif.map(({ width }) => width)).toEqual([480, 800]);
		expect(image.variants.webp.map(({ width }) => width)).toEqual([800]);
	});
});
