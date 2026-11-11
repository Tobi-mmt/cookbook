/** How images are placed in the PDF of a cookbook, also used by the editor for its hint */
import type { Recipe, RecipeImage } from '../types';

export type PdfQuality = 'lesen' | 'druck';

/** Resolution of the images in the PDF: small for the screen, full for printing */
export const QUALITY = {
	lesen: { dpi: 150, jpeg: 78 },
	druck: { dpi: 300, jpeg: 90 }
} satisfies Record<PdfQuality, { dpi: number; jpeg: number }>;

/** Below this resolution a photo looks soft on paper */
export const MIN_PRINT_DPI = 200;

const MM_PER_INCH = 25.4;

/** A4 minus the margins of `cookbook.typ` */
export const CONTENT_WIDTH_MM = 180;
export const FULL_IMAGE_HEIGHT_MM = 95;
export const COVER_MM = { width: 210, height: 180 };
const SIDE_ASPECT = 3 / 4;
const SIDE_MAX_WIDTH_MM = 95;
const SIDE_MIN_WIDTH_MM = 45;

export type ImageSource = { url: string; width: number; height: number };

/** The largest stored version of an image: the print image, else the largest AVIF or WebP */
export const bestSource = (image: RecipeImage): ImageSource | null => {
	if (image.print) return image.print;
	const variants = [...image.variants.avif, ...image.variants.webp];
	if (!variants.length) return null;
	const largest = variants.reduce((a, b) => (b.width > a.width ? b : a));
	return {
		url: largest.url,
		width: largest.width,
		height: Math.round((largest.width * image.height) / image.width)
	};
};

type Box = { width: number; height: number };

/** The resolution of an image cropped to fill a box (in mm) */
export const dpiInBox = (source: Box, box: Box) =>
	Math.min(source.width / (box.width / MM_PER_INCH), source.height / (box.height / MM_PER_INCH));

export type ImageLayout = {
	/** full width above the title, or smaller next to it */
	layout: 'full' | 'side';
	width: number;
	height: number;
	dpi: number;
};

/**
 * Sharp images span the page, smaller ones are printed smaller next to the title instead of
 * being scaled up. Images too small even for that are left out, the text gets the room.
 */
export const imageLayout = (source: Box): ImageLayout | null => {
	const full = { width: CONTENT_WIDTH_MM, height: FULL_IMAGE_HEIGHT_MM };
	const fullDpi = dpiInBox(source, full);
	if (fullDpi >= MIN_PRINT_DPI) return { layout: 'full', ...full, dpi: fullDpi };

	const width = Math.min(
		SIDE_MAX_WIDTH_MM,
		(Math.min(source.width, source.height / SIDE_ASPECT) * MM_PER_INCH) / MIN_PRINT_DPI
	);
	if (width < SIDE_MIN_WIDTH_MM) return null;
	const side = { width, height: width * SIDE_ASPECT };
	return { layout: 'side', ...side, dpi: dpiInBox(source, side) };
};

/** Pixels for a box at the resolution of the quality, never more than the source has */
export const targetPixels = (source: Box, box: Box, quality: PdfQuality) => {
	const { dpi } = QUALITY[quality];
	const wanted = {
		width: (box.width / MM_PER_INCH) * dpi,
		height: (box.height / MM_PER_INCH) * dpi
	};
	const upscale = Math.max(wanted.width / source.width, wanted.height / source.height, 1);
	return {
		width: Math.max(1, Math.round(wanted.width / upscale)),
		height: Math.max(1, Math.round(wanted.height / upscale))
	};
};

export type SoftImage = { id: string; title: string; dpi: number; omitted: boolean };

/** Which images look soft on paper, shown before generating so people can replace them */
export const softImages = (recipes: Pick<Recipe, 'id' | 'title' | 'image'>[]): SoftImage[] =>
	recipes.flatMap(({ id, title, image }) => {
		const source = image && bestSource(image);
		if (!source) return [];
		const layout = imageLayout(source);
		if (layout?.layout === 'full') return [];
		return [{ id, title, dpi: Math.round(layout?.dpi ?? 0), omitted: !layout }];
	});
