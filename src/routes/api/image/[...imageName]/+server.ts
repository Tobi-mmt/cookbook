import type { RequestHandler } from '@sveltejs/kit';
import sharp from 'sharp';

export const GET: RequestHandler = async ({ url: { searchParams }, params: { imageName } }) => {
	const imageOptions = { width: 1700 };
	if (searchParams.has('width')) imageOptions.width = parseInt(searchParams.get('width'));

	try {
		const image = await sharp(`static/recipes/${imageName}`)
			.resize({ width: imageOptions.width })
			.toBuffer();

		return new Response(image, {
			status: 200,
			headers: {
				'access-control-allow-origin': '*',
				'Content-Type': `image/webp`,
				'Content-Length': image.length
			}
		});
	} catch (e: any) {
		return new Response(`An error occured: ${e}`, { status: 500 });
	}
};
