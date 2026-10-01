const MAX_SIZE = 2400;

/**
 * Scales the image down to at most 2400px before the upload, so that phone photos stay
 * below the 4.5 MB request limit of Vercel functions. The server creates the final variants.
 */
export const resizeImage = async (file: File): Promise<Blob> => {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Converting the image failed'))),
			'image/jpeg',
			0.9
		)
	);
};
