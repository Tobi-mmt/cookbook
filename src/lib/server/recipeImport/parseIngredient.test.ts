import { describe, expect, test } from 'vitest';
import { parseIngredient } from './parseIngredient';

describe('parseIngredient', () => {
	test.each([
		['100 g Mehl', { quantity: 100, unit: 'g', name: 'Mehl' }],
		['100g Mehl', { quantity: 100, unit: 'g', name: 'Mehl' }],
		['0,5 l Milch', { quantity: 0.5, unit: 'l', name: 'Milch' }],
		['1/2 TL Salz', { quantity: 0.5, unit: 'TL', name: 'Salz' }],
		['1 1/2 EL Öl (kalt)', { quantity: 1.5, unit: 'EL', name: 'Öl (kalt)' }],
		['½ Bund Petersilie', { quantity: 0.5, unit: 'Bund', name: 'Petersilie' }],
		['2-3 Zehen Knoblauch', { quantity: 2, unit: 'Zehen', name: 'Knoblauch' }],
		['1 Pck. Vanillezucker', { quantity: 1, unit: 'Pck.', name: 'Vanillezucker' }],
		['2 Ei(er) (Größe M)', { quantity: 2, unit: null, name: 'Ei(er) (Größe M)' }],
		['Salz', { quantity: null, unit: null, name: 'Salz' }],
		[
			'Pancetta (oder Guanciale, , alternativ Speck)',
			{ quantity: null, unit: null, name: 'Pancetta (oder Guanciale, alternativ Speck)' }
		]
	])('%s', (text, expected) => {
		expect(parseIngredient(text)).toEqual(expected);
	});
});
