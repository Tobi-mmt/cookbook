import { describe, expect, test } from 'vitest';
import {
	isBot,
	normalizePath,
	normalizeReferrer,
	parseUserAgent,
	trackingDay,
	visitorHash
} from './tracking';

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
	test('counts the landing pages and the about page', () => {
		expect(normalizePath('/rezepte')).toBe('/rezepte');
		expect(normalizePath('/rezepte/vegan')).toBe('/rezepte/vegan');
		expect(normalizePath('/ueber')).toBe('/ueber');
		expect(normalizePath('/kosten')).toBe('/kosten');
		expect(normalizePath('/rezepteabc')).toBeNull();
	});

	test('accepts public pages without query and hash', () => {
		expect(normalizePath('/')).toBe('/');
		expect(normalizePath('/rezept/abc/pfannkuchen?x=1#top')).toBe('/rezept/abc/pfannkuchen');
		expect(normalizePath('/@tobi/unser-kochbuch')).toBe('/@tobi/unser-kochbuch');
	});

	test('rejects other paths', () => {
		expect(normalizePath('/admin')).toBeNull();
		expect(normalizePath('/api/event')).toBeNull();
		expect(normalizePath('https://example.com/')).toBeNull();
		expect(normalizePath('//example.com/rezept/x')).toBeNull();
		expect(normalizePath(`/rezept/${'x'.repeat(300)}`)).toBeNull();
	});
});

describe('parseUserAgent', () => {
	test.each([
		[browser, 'Safari', 'macOS'],
		[
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
			'Chrome',
			'Windows'
		],
		[
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
			'Edge',
			'Windows'
		],
		[
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
			'Safari',
			'iOS'
		],
		[
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.0.0 Mobile/15E148 Safari/604.1',
			'Chrome',
			'iOS'
		],
		[
			'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
			'Samsung Internet',
			'Android'
		],
		['Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0', 'Firefox', 'Linux'],
		['something else', null, null]
	])('%s', (userAgent, browser, os) => {
		expect(parseUserAgent(userAgent)).toEqual({ browser, os });
	});
});

describe('normalizeReferrer', () => {
	test('keeps only the domain of other sites', () => {
		expect(normalizeReferrer('https://www.google.com/search?q=dal', 'kochbuchbande.de')).toBe(
			'google.com'
		);
		expect(normalizeReferrer('https://chatgpt.com/c/123', 'kochbuchbande.de')).toBe('chatgpt.com');
	});

	test('ignores the own site, other protocols and junk', () => {
		expect(normalizeReferrer('https://kochbuchbande.de/rezepte', 'kochbuchbande.de')).toBeNull();
		expect(normalizeReferrer('https://www.kochbuchbande.de/', 'kochbuchbande.de')).toBeNull();
		expect(normalizeReferrer('android-app://com.google.android.gm', 'kochbuchbande.de')).toBeNull();
		expect(normalizeReferrer('kein link', 'kochbuchbande.de')).toBeNull();
		expect(normalizeReferrer(undefined, 'kochbuchbande.de')).toBeNull();
	});
});
