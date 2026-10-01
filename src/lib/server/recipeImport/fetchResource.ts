const USER_AGENT =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const TIMEOUT = 10_000;
const MAX_PAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

/** Errors with a message that can be shown in the admin */
export class ImportError extends Error {}

const fetchResource = async (url: string, accept: string, maxSize: number) => {
	let response: Response;
	try {
		response = await fetch(url, {
			headers: { 'user-agent': USER_AGENT, accept, 'accept-language': 'de-DE,de;q=0.9' },
			signal: AbortSignal.timeout(TIMEOUT)
		});
	} catch (error) {
		console.error(error);
		throw new ImportError('Die Seite konnte nicht geladen werden.');
	}
	if (!response.ok) throw new ImportError(`Die Seite antwortet mit Status ${response.status}.`);

	const body = Buffer.from(await response.arrayBuffer());
	if (body.length > maxSize) throw new ImportError('Die Datei ist zu groß.');
	return { body, contentType: response.headers.get('content-type') ?? '' };
};

export const fetchPage = async (url: string) => {
	const { body, contentType } = await fetchResource(url, 'text/html,*/*;q=0.8', MAX_PAGE_SIZE);
	const charset = contentType.match(/charset=([\w-]+)/i)?.[1] ?? 'utf-8';
	try {
		return new TextDecoder(charset).decode(body);
	} catch {
		return new TextDecoder().decode(body);
	}
};

export const fetchImage = async (url: string) => {
	const { body, contentType } = await fetchResource(url, 'image/*', MAX_IMAGE_SIZE);
	if (!contentType.startsWith('image/')) throw new ImportError('Die Datei ist kein Bild.');
	return body;
};
