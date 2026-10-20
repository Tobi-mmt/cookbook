import { describe, expect, test } from 'vitest';
import { cleanSourceUrl } from './sourceUrl';

describe('cleanSourceUrl', () => {
	test('removes tracking parameters and the anchor', () => {
		expect(
			cleanSourceUrl(
				'https://www.chefkoch.de/rezepte/1/Dal.html?utm_source=x&portionen=4&fbclid=y#kommentare'
			)
		).toBe('https://www.chefkoch.de/rezepte/1/Dal.html?portionen=4');
	});

	test('keeps a clean address as it is', () => {
		expect(cleanSourceUrl('https://lecker.de/dal-123')).toBe('https://lecker.de/dal-123');
	});
});
