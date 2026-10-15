import { describe, expect, test } from 'vitest';
import { suggestUsername, toSlug, validateUsername } from './username';

describe('toSlug', () => {
	test('writes umlauts out and replaces everything else with single hyphens', () => {
		expect(toSlug('Jürgen Groß')).toBe('juergen-gross');
		expect(toSlug('  Crème  brûlée!! ')).toBe('creme-brulee');
		expect(toSlug('Unser Kochbuch')).toBe('unser-kochbuch');
	});

	test('cuts long names without a trailing hyphen', () => {
		expect(toSlug('a'.repeat(29) + ' b')).toBe('a'.repeat(29));
	});
});

describe('suggestUsername', () => {
	test('uses the name and falls back to the email address', () => {
		expect(suggestUsername('Mona')).toBe('mona');
		expect(suggestUsername('', 'tobi.l@example.com')).toBe('tobi-l');
		expect(suggestUsername('Jo', 'x@example.com')).toBe('');
	});
});

describe('validateUsername', () => {
	test.each([
		['tobi', null],
		['tobi-2', null],
		['to', 'Mindestens 3 Zeichen'],
		['Tobi', 'Nur Kleinbuchstaben, Ziffern und Bindestriche'],
		['tobi-', 'Bindestriche nur einzeln und nicht am Anfang oder Ende'],
		['to--bi', 'Bindestriche nur einzeln und nicht am Anfang oder Ende'],
		['admin', 'Dieser Name ist reserviert'],
		['a'.repeat(31), 'Höchstens 30 Zeichen']
	])('%s', (username, expected) => {
		expect(validateUsername(username)).toBe(expected);
	});
});
