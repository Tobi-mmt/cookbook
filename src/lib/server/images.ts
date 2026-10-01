import { createHash } from 'node:crypto';
import sharp, { type Sharp } from 'sharp';
import type { ImageFormat, ImageVariant, RecipeImage } from '../../types';
import type { Storage } from './storage';

export const IMAGE_WIDTHS = [480, 960, 1600, 2400];

const FORMAT_OPTIONS: Record<ImageFormat, (image: Sharp) => Sharp> = {
	avif: (image) => image.avif({ quality: 55 }),
	webp: (image) => image.webp({ quality: 78 })
};

/** Creates the tiny blurred placeholder, same as the former `yarn get-thumbnail` */
export const createPlaceholder = async (input: Buffer) => {
	const buffer = await sharp(input).rotate().resize(15).webp().toBuffer();
	return `data:image/webp;base64,${buffer.toString('base64')}`;
};

/** Resizes the uploaded image to all responsive widths and formats and stores them */
export const processAndStoreImage = async (
	input: Buffer,
	recipeId: string,
	storage: Storage
): Promise<RecipeImage> => {
	// .rotate() applies the EXIF orientation of phone photos
	const { data: normalized, info } = await sharp(input)
		.rotate()
		.toBuffer({ resolveWithObject: true });
	const hash = createHash('sha256').update(input).digest('hex').slice(0, 10);

	const widths = [...new Set(IMAGE_WIDTHS.map((width) => Math.min(width, info.width)))];
	const variants: Record<ImageFormat, ImageVariant[]> = { avif: [], webp: [] };

	for (const format of Object.keys(FORMAT_OPTIONS) as ImageFormat[]) {
		for (const width of widths) {
			const body = await FORMAT_OPTIONS[format](sharp(normalized).resize(width)).toBuffer();
			const url = await storage.putFile(
				`recipes/${recipeId}/${hash}-${width}.${format}`,
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
		variants
	};
};

export const imageUrls = (image: RecipeImage | null | undefined) =>
	image ? Object.values(image.variants).flatMap((variants) => variants.map(({ url }) => url)) : [];
