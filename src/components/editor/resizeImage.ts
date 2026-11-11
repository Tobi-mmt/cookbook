const MAX_SIZE = 3000;
/** Below the limit of the server (4 MB) with room for the form */
const MAX_BYTES = 3.8 * 1024 * 1024;
const QUALITIES = [0.9, 0.85, 0.8, 0.7, 0.6];

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
	new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Converting the image failed'))),
			'image/jpeg',
			quality
		)
	);

/**
 * Scales the image down to at most 3000px before the upload, large enough for the print image
 * of the cookbook PDF. The quality goes down until the photo fits the 4.5 MB request limit of
 * Vercel functions. The server creates the final variants.
 */
export const resizeImage = async (file: File) => {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	let blob: Blob | undefined;
	for (const quality of QUALITIES) {
		blob = await toJpeg(canvas, quality);
		if (blob.size <= MAX_BYTES) break;
	}
	return { blob: blob!, width: canvas.width, height: canvas.height };
};
