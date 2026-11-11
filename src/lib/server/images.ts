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

/**
 * The print image for the PDF of a cookbook: at 3000 px it fills an A4 page in width with more
 * than 300 dpi. A JPEG in high quality, since the AVIF variants are compressed for the web.
 */
export const PRINT_SIZE = 3000;

const FORMAT_OPTIONS: Record<ImageFormat, (image: Sharp) => Sharp> = {
	avif: (image) => image.avif({ quality: 55 }),
	webp: (image) => image.webp({ quality: 78 })
};

/** Creates the tiny blurred placeholder, same as the former `yarn get-thumbnail` */
export const createPlaceholder = async (input: Buffer) => {
	const buffer = await sharp(input).rotate().resize(15).webp().toBuffer();
	return `data:image/webp;base64,${buffer.toString('base64')}`;
};

/** Images belong to their recipe and keep their path when it moves, a copy gets copies */
export const imageFolder = (recipeId: string) => `recipes/${recipeId}`;

const storeVariant = async (
	normalized: Buffer,
	format: ImageFormat,
	width: number,
	{ folder, hash, storage }: { folder: string; hash: string; storage: Storage }
) => {
	const body = await FORMAT_OPTIONS[format](sharp(normalized).resize(width)).toBuffer();
	const url = await storage.putFile(
		`${folder}/${hash}-${width}.${format}`,
		body,
		`image/${format}`
	);
	return { variant: { width, url }, bytes: body.length };
};

const storePrintImage = async (
	normalized: Buffer,
	{ folder, hash, storage }: { folder: string; hash: string; storage: Storage }
) => {
	const { data, info } = await sharp(normalized)
		.resize(PRINT_SIZE, PRINT_SIZE, { fit: 'inside', withoutEnlargement: true })
		.toColorspace('srgb')
		.jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
		.toBuffer({ resolveWithObject: true });
	const url = await storage.putFile(`${folder}/${hash}-print.jpg`, data, 'image/jpeg');
	return { variant: { width: info.width, height: info.height, url }, bytes: data.length };
};

export type AvifVariants = { variants: ImageVariant[]; bytes: number };

/**
 * Stores the placeholder and the WebP, which takes a fraction of a second, and returns the
 * AVIF variants as a separate step: encoding them takes many seconds and can run after the
 * response.
 */
export const storeImagePreview = async (input: Buffer, folder: string, storage: Storage) => {
	// .rotate() applies the EXIF orientation of phone photos
	const { data: normalized, info } = await sharp(input)
		.rotate()
		.toBuffer({ resolveWithObject: true });
	const target = {
		folder,
		hash: createHash('sha256').update(input).digest('hex').slice(0, 10),
		storage
	};
	const [webp, print] = await Promise.all([
		storeVariant(normalized, 'webp', Math.min(WEBP_WIDTH, info.width), target),
		storePrintImage(normalized, target)
	]);

	const image: RecipeImage = {
		width: info.width,
		height: info.height,
		placeholder: await createPlaceholder(normalized),
		variants: { avif: [], webp: [webp.variant] },
		print: print.variant,
		bytes: webp.bytes + print.bytes
	};
	const createAvif = async (): Promise<AvifVariants> => {
		const widths = [...new Set(IMAGE_WIDTHS.map((width) => Math.min(width, info.width)))];
		const stored = [];
		for (const width of widths) stored.push(await storeVariant(normalized, 'avif', width, target));
		return {
			variants: stored.map(({ variant }) => variant),
			bytes: stored.reduce((sum, { bytes }) => sum + bytes, 0)
		};
	};
	return { image, createAvif };
};

/** Resizes the image to all responsive widths in AVIF and one WebP and stores them */
export const processAndStoreImage = async (
	input: Buffer,
	folder: string,
	storage: Storage
): Promise<RecipeImage> => {
	const { image, createAvif } = await storeImagePreview(input, folder, storage);
	const avif = await createAvif();
	return {
		...image,
		variants: { ...image.variants, avif: avif.variants },
		bytes: (image.bytes ?? 0) + avif.bytes
	};
};

/** All files of an image, the first one identifies it */
export const imageUrls = (image: RecipeImage | null | undefined) =>
	image
		? [
				...Object.values(image.variants).flatMap((variants) => variants.map(({ url }) => url)),
				...(image.print ? [image.print.url] : [])
			]
		: [];

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
	const [avif, webp, print] = await Promise.all([
		copyVariants(image.variants.avif),
		copyVariants(image.variants.webp),
		image.print ? copyVariants([image.print]) : []
	]);
	return {
		...image,
		variants: { avif, webp },
		...(image.print ? { print: { ...image.print, url: print[0].url } } : {})
	};
};
