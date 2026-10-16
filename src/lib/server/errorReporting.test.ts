import { describe, expect, test } from 'vitest';
import { buildEnvelope, parseDsn, parseStack } from './errorReporting';

describe('parseDsn', () => {
	test('finds the envelope endpoint and the key', () => {
		expect(parseDsn('https://abc123@bugs.example.com/7')).toEqual({
			endpoint: 'https://bugs.example.com/api/7/envelope/',
			key: 'abc123'
		});
		expect(parseDsn('https://abc123@example.com/bugsink/7')?.endpoint).toBe(
			'https://example.com/bugsink/api/7/envelope/'
		);
	});

	test('rejects a DSN without key', () => {
		expect(parseDsn('https://bugs.example.com/7')).toBeNull();
	});
});

describe('parseStack', () => {
	test('reads Chrome stacks, the oldest frame first', () => {
		const stack = [
			'TypeError: x is undefined',
			'    at render (https://kochbuchbande.de/_app/a.js:10:5)',
			'    at https://kochbuchbande.de/_app/b.js:20:7'
		].join('\n');
		expect(parseStack(stack)).toEqual([
			{ filename: 'https://kochbuchbande.de/_app/b.js', lineno: 20, colno: 7 },
			{ function: 'render', filename: 'https://kochbuchbande.de/_app/a.js', lineno: 10, colno: 5 }
		]);
	});

	test('reads Firefox and Safari stacks', () => {
		expect(parseStack('render@https://kochbuchbande.de/_app/a.js:10:5')).toEqual([
			{ function: 'render', filename: 'https://kochbuchbande.de/_app/a.js', lineno: 10, colno: 5 }
		]);
	});
});

describe('buildEnvelope', () => {
	test('wraps one event in a Sentry envelope', () => {
		const [header, item, event] = buildEnvelope(
			{ name: 'TypeError', message: 'kaputt', path: '/rezept/[id]', runtime: 'browser' },
			new Date('2026-10-16T10:00:00Z')
		)
			.split('\n')
			.map((line) => JSON.parse(line));
		expect(header.event_id).toMatch(/^[0-9a-f]{32}$/);
		expect(item).toEqual({ type: 'event' });
		expect(event).toMatchObject({
			event_id: header.event_id,
			timestamp: 1792144800,
			platform: 'javascript',
			level: 'error',
			exception: { values: [{ type: 'TypeError', value: 'kaputt' }] },
			tags: { runtime: 'browser' }
		});
	});
});
