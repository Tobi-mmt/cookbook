import { describe, expect, test } from 'vitest';
import { isBot, normalizePath, trackingDay, visitorHash } from './tracking';

const browser =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

describe('trackingDay', () => {
	test('changes at midnight in German time', () => {
		expect(trackingDay(new Date('2026-10-12T21:59:59Z'))).toBe('2026-10-12');
		expect(trackingDay(new Date('2026-10-12T22:00:00Z'))).toBe('2026-10-13');
		// winter time
		expect(trackingDay(new Date('2026-12-31T23:00:00Z'))).toBe('2027-01-01');
	});
});

describe('visitorHash', () => {
	test('is stable for the same salt and visitor', () => {
		expect(visitorHash('salt', 'host', '1.2.3.4', browser)).toBe(
			visitorHash('salt', 'host', '1.2.3.4', browser)
		);
	});

	test('changes with the salt, the IP or the user agent', () => {
		const hash = visitorHash('salt', 'host', '1.2.3.4', browser);
		expect(visitorHash('other-salt', 'host', '1.2.3.4', browser)).not.toBe(hash);
		expect(visitorHash('salt', 'host', '1.2.3.5', browser)).not.toBe(hash);
		expect(visitorHash('salt', 'host', '1.2.3.4', `${browser} x`)).not.toBe(hash);
	});

	test('does not contain the IP', () => {
		expect(visitorHash('salt', 'host', '1.2.3.4', browser)).not.toContain('1.2.3.4');
	});
});

describe('isBot', () => {
	test('detects bots and missing user agents', () => {
		expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(
			true
		);
		expect(isBot('curl/8.7.1')).toBe(true);
		expect(isBot(null)).toBe(true);
		expect(isBot('')).toBe(true);
	});

	test('accepts browsers', () => {
		expect(isBot(browser)).toBe(false);
	});
});

describe('normalizePath', () => {
	test('accepts public pages without query and hash', () => {
		expect(normalizePath('/')).toBe('/');
		expect(normalizePath('/recipe/abc/pfannkuchen?x=1#top')).toBe('/recipe/abc/pfannkuchen');
	});

	test('rejects other paths', () => {
		expect(normalizePath('/admin')).toBeNull();
		expect(normalizePath('/api/event')).toBeNull();
		expect(normalizePath('https://example.com/')).toBeNull();
		expect(normalizePath('//example.com/recipe/x')).toBeNull();
		expect(normalizePath(`/recipe/${'x'.repeat(300)}`)).toBeNull();
	});
});
