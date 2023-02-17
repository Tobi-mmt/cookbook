import type { RequestHandler } from '@sveltejs/kit';
import sharp from 'sharp';

const ONE_YEAR_IN_SECONDS = 24 * 60 * 60 * 365;

export const GET: RequestHandler = async ({ url, params: { imageName } }) => {
	const imageOptions = { width: 1700 };
	if (url.searchParams.has('width')) imageOptions.width = parseInt(url.searchParams.get('width'));

	try {
		const fetchedImage = await fetch(`${url.origin}/recipes/${imageName}`);
		const body = await fetchedImage.arrayBuffer();
		const image = await sharp(Buffer.from(body)).resize({ width: imageOptions.width }).toBuffer();

		return new Response(image, {
			status: 200,
			headers: {
				'access-control-allow-origin': '*',
				'Content-Type': `image/webp`,
				'Content-Length': image.length,
				'Cache-Control': `s-maxage=${ONE_YEAR_IN_SECONDS}, stale-while-revalidate`
			}
		});
	} catch (e: any) {
		return new Response(`An error occured: ${e}`, { status: 500 });
	}
};
