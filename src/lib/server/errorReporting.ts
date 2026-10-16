import { randomUUID } from 'node:crypto';
import { BUGSINK_DSN, VERCEL_ENV, VERCEL_GIT_COMMIT_SHA } from '$app/env/private';

export type ErrorReport = {
	name: string;
	message: string;
	stack?: string;
	/** the page or endpoint, without query, so that no tokens end up in the tracker */
	path: string;
	method?: string;
	runtime: 'server' | 'browser';
	tags?: Record<string, string | null>;
};

type Frame = { function?: string; filename: string; lineno: number; colno: number };

const CHROME_LINE = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/;
const FIREFOX_SAFARI_LINE = /^\s*(.*?)@(.+?):(\d+):(\d+)$/;

/** The frames of V8, Firefox and Safari stacks, the oldest first as Sentry expects */
export const parseStack = (stack: string | undefined): Frame[] =>
	(stack ?? '')
		.split('\n')
		.flatMap((line) => {
			const match = line.match(CHROME_LINE) ?? line.match(FIREFOX_SAFARI_LINE);
			if (!match) return [];
			const [, fn, filename, lineno, colno] = match;
			return [
				{
					...(fn && { function: fn }),
					filename,
					lineno: Number(lineno),
					colno: Number(colno)
				}
			];
		})
		.reverse();

/** `https://key@host/42` → the envelope endpoint of project 42 and its key */
export const parseDsn = (dsn: string) => {
	const url = new URL(dsn);
	const segments = url.pathname.split('/').filter(Boolean);
	const projectId = segments.pop();
	if (!url.username || !projectId) return null;
	const prefix = segments.length ? `/${segments.join('/')}` : '';
	return {
		endpoint: `${url.protocol}//${url.host}${prefix}/api/${projectId}/envelope/`,
		key: url.username
	};
};

/** A Sentry envelope with one event, the format Bugsink understands */
export const buildEnvelope = (report: ErrorReport, now = new Date()) => {
	const eventId = randomUUID().replaceAll('-', '');
	const event = {
		event_id: eventId,
		timestamp: now.getTime() / 1000,
		platform: report.runtime === 'server' ? 'node' : 'javascript',
		level: 'error',
		environment: VERCEL_ENV ?? 'development',
		...(VERCEL_GIT_COMMIT_SHA && { release: VERCEL_GIT_COMMIT_SHA }),
		transaction: report.path,
		request: { url: report.path, ...(report.method && { method: report.method }) },
		tags: { runtime: report.runtime, ...report.tags },
		exception: {
			values: [
				{
					type: report.name,
					value: report.message,
					stacktrace: { frames: parseStack(report.stack) }
				}
			]
		}
	};
	return [
		JSON.stringify({ event_id: eventId, sent_at: now.toISOString() }),
		JSON.stringify({ type: 'event' }),
		JSON.stringify(event)
	].join('\n');
};

/** Sends the error to Bugsink, without a DSN (locally) nothing is sent. Never throws. */
export const reportError = async (report: ErrorReport) => {
	const target = BUGSINK_DSN ? parseDsn(BUGSINK_DSN) : null;
	if (!target) return;
	try {
		const response = await fetch(target.endpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-sentry-envelope',
				'x-sentry-auth': `Sentry sentry_version=7, sentry_key=${target.key}, sentry_client=kochbuchbande/1`
			},
			body: buildEnvelope(report),
			signal: AbortSignal.timeout(3000)
		});
		if (!response.ok) console.error(`Bugsink answered ${response.status}`);
	} catch (error) {
		console.error('Bugsink not reachable', error);
	}
};

/** Name, message and stack of anything that was thrown */
export const describeError = (error: unknown) =>
	error instanceof Error
		? { name: error.name, message: error.message, stack: error.stack }
		: { name: 'Error', message: String(error) };
