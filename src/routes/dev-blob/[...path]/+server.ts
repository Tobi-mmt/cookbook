import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { readLocalFile } from '$lib/server/storage';

const CONTENT_TYPES: Record<string, string> = {
	avif: 'image/avif',
	webp: 'image/webp'
};

/** Serves the images of the local storage driver, replaces Vercel Blob during development */
export async function GET({ params }) {
	if (!dev) error(404);
	try {
		const file = await readLocalFile(params.path);
		const extension = params.path.split('.').pop() ?? '';
		return new Response(new Uint8Array(file), {
			headers: { 'content-type': CONTENT_TYPES[extension] ?? 'application/octet-stream' }
		});
	} catch {
		error(404);
	}
}
