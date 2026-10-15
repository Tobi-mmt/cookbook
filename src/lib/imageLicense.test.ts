import { describe, expect, test } from 'vitest';
import { imageCaption, licenseLabel, licenseUrl, parseLicense } from './imageLicense';

describe('parseLicense', () => {
	test.each([
		['https://creativecommons.org/licenses/by/4.0/', 'CC-BY-4.0'],
		['https://creativecommons.org/licenses/by-sa/3.0/de/', 'CC-BY-SA-3.0'],
		['http://creativecommons.org/publicdomain/zero/1.0/', 'CC0-1.0'],
		['CC BY-SA 4.0', 'CC-BY-SA-4.0'],
		['https://creativecommons.org/licenses/by-nc/4.0/', null],
		['https://creativecommons.org/licenses/by-nd/4.0/', null],
		['Alle Rechte vorbehalten', null],
		[undefined, null]
	])('%s', (value, expected) => {
		expect(parseLicense(value)).toBe(expected);
	});
});

test('licenseLabel and licenseUrl', () => {
	expect(licenseLabel('CC-BY-SA-4.0')).toBe('CC BY-SA 4.0');
	expect(licenseUrl('CC-BY-4.0')).toBe('https://creativecommons.org/licenses/by/4.0/deed.de');
});

test('imageCaption', () => {
	const image = { width: 1, height: 1, placeholder: '', variants: { avif: [], webp: [] } };
	expect(imageCaption(image)).toBeNull();
	expect(imageCaption({ ...image, aiGenerated: true })).toBe('Bild KI-generiert');
	expect(
		imageCaption({
			...image,
			license: 'CC-BY-4.0',
			author: 'Max Muster',
			sourceUrl: 'https://www.chefkoch.de/rezepte/1'
		})
	).toBe('Foto: Max Muster, CC BY 4.0, via chefkoch.de');
});
