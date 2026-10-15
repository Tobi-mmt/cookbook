import { createHash } from 'node:crypto';
import sharp, { type Sharp } from 'sharp';
import type { ImageFormat, ImageVariant, RecipeImage } from '../../types';
import type { Storage } from './storage';

export const IMAGE_WIDTHS = [480, 960, 1600, 2400];

/**
 * Every current browser shows AVIF, so only AVIF comes in all widths. Older browsers and social
 * networks, which often cannot show AVIF, get a single WebP in the width social networks recommend.
 */
export const WEBP_WIDTH = 1200;

const FORMAT_OPTIONS: Record<ImageFormat, (image: Sharp) => Sharp> = {
	avif: (image) => image.avif({ quality: 55 }),
	webp: (image) => image.webp({ quality: 78 })
};

/** Creates the tiny blurred placeholder, same as the former `yarn get-thumbnail` */
export const createPlaceholder = async (input: Buffer) => {
	const buffer = await sharp(input).rotate().resize(15).webp().toBuffer();
	return `data:image/webp;base64,${buffer.toString('base64')}`;
};

/** Images live with their recipe and cookbook, a copied recipe gets copies of its images */
export const imageFolder = (cookbookId: string, recipeId: string) =>
	`cookbooks/${cookbookId}/recipes/${recipeId}`;

/** Resizes the uploaded image to all responsive widths in AVIF and one WebP and stores them */
export const processAndStoreImage = async (
	input: Buffer,
	folder: string,
	storage: Storage
): Promise<RecipeImage> => {
	// .rotate() applies the EXIF orientation of phone photos
	const { data: normalized, info } = await sharp(input)
		.rotate()
		.toBuffer({ resolveWithObject: true });
	const hash = createHash('sha256').update(input).digest('hex').slice(0, 10);

	const widthsByFormat: Record<ImageFormat, number[]> = {
		avif: [...new Set(IMAGE_WIDTHS.map((width) => Math.min(width, info.width)))],
		webp: [Math.min(WEBP_WIDTH, info.width)]
	};
	const variants: Record<ImageFormat, ImageVariant[]> = { avif: [], webp: [] };
	let bytes = 0;

	for (const format of Object.keys(FORMAT_OPTIONS) as ImageFormat[]) {
		for (const width of widthsByFormat[format]) {
			const body = await FORMAT_OPTIONS[format](sharp(normalized).resize(width)).toBuffer();
			bytes += body.length;
			const url = await storage.putFile(
				`${folder}/${hash}-${width}.${format}`,
				body,
				`image/${format}`
			);
			variants[format].push({ width, url });
		}
	}

	return {
		width: info.width,
		height: info.height,
		placeholder: await createPlaceholder(normalized),
		variants,
		bytes
	};
};

export const imageUrls = (image: RecipeImage | null | undefined) =>
	image ? Object.values(image.variants).flatMap((variants) => variants.map(({ url }) => url)) : [];

export const copyImage = async (
	image: RecipeImage,
	folder: string,
	storage: Storage
): Promise<RecipeImage> => {
	const copyVariants = (variants: RecipeImage['variants'][keyof RecipeImage['variants']]) =>
		Promise.all(
			variants.map(async ({ width, url }) => ({
				width,
				url: await storage.copyFile(url, `${folder}/${url.split('/').pop()}`)
			}))
		);
	const [avif, webp] = await Promise.all([
		copyVariants(image.variants.avif),
		copyVariants(image.variants.webp)
	]);
	return { ...image, variants: { avif, webp } };
};
