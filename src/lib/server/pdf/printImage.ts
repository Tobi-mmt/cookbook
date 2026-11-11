import sharp from 'sharp';
import { QUALITY, targetPixels, type PdfQuality } from '../../printLayout';

type Box = { width: number; height: number };

/** Crops the image to the box and stores it as JPEG, which Typst can embed */
export const toPrintJpeg = async (input: Buffer, source: Box, box: Box, quality: PdfQuality) => {
	const { width, height } = targetPixels(source, box, quality);
	return sharp(input)
		.rotate()
		.resize(width, height, { fit: 'cover', position: sharp.strategy.attention })
		.flatten({ background: '#ffffff' })
		.toColorspace('srgb')
		.jpeg({ quality: QUALITY[quality].jpeg, chromaSubsampling: '4:4:4' })
		.toBuffer();
};
