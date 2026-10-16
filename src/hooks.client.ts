import type { HandleClientError } from '@sveltejs/kit/hooks';

const MAX_REPORTS = 5;
const sent = new Set<string>();

/** Sends an error once per page load to `/api/fehler`, at most a handful */
const report = (error: unknown) => {
	const { name, message, stack } =
		error instanceof Error ? error : { name: 'Error', message: String(error), stack: undefined };
	if (sent.has(message) || sent.size >= MAX_REPORTS || navigator.webdriver) return;
	sent.add(message);
	navigator.sendBeacon(
		'/api/fehler',
		JSON.stringify({ name, message, stack, path: location.pathname })
	);
};

export const init = () => {
	addEventListener('error', (event) => report(event.error ?? event.message));
	addEventListener('unhandledrejection', (event) => report(event.reason));
};

export const handleError: HandleClientError = ({ error, kind }) => {
	if (kind === 'unknown') report(error);
};
