import { describe, expect, test } from 'vitest';
import { completePortionUnit, isServing, parseYield, portionLabel } from './portionUnit';

describe('portionLabel', () => {
	test.each([
		[4, 'Portionen', '4 Portionen'],
		[1, 'Portionen', '1 Portion'],
		[1, 'Muffins', '1 Muffin'],
		[35, 'muffin', '35 Muffins'],
		[2, 'Blech', '2 Bleche'],
		[3, 'Kuchen', '3 Kuchen'],
		[1, 'Gläser', '1 Glas'],
		[2, 'Zimtschnecken', '2 Zimtschnecken'],
		[2, '', '2 Portionen'],
		[2, undefined, '2 Portionen']
	])('%i %s', (count, unit, expected) => {
		expect(portionLabel(count, unit)).toBe(expected);
	});
});

describe('completePortionUnit', () => {
	test('completes a known unit in the form for the count', () => {
		expect(completePortionUnit('Mu', 12)).toBe('Muffins');
		expect(completePortionUnit('mu', 1)).toBe('Muffin');
		expect(completePortionUnit('Glä', 1)).toBe('Gläser');
		expect(completePortionUnit('Ku', 1)).toBe('Kuchen');
	});

	test('suggests nothing for an empty, complete or unknown unit', () => {
		expect(completePortionUnit('', 2)).toBeUndefined();
		expect(completePortionUnit('Kuchen', 2)).toBeUndefined();
		expect(completePortionUnit('Zimtsch', 2)).toBeUndefined();
	});
});

test('isServing', () => {
	expect(isServing('Portionen')).toBe(true);
	expect(isServing(undefined)).toBe(true);
	expect(isServing('Person')).toBe(true);
	expect(isServing('Muffins')).toBe(false);
});

describe('parseYield', () => {
	test.each([
		['4', { count: 4, unit: 'Portionen' }],
		['4 Personen', { count: 4, unit: 'Personen' }],
		['2 2 Portionen', { count: 2, unit: 'Portionen' }],
		['12 Muffins', { count: 12, unit: 'Muffins' }],
		['1 Kuchen (28 cm)', { count: 1, unit: 'Kuchen' }],
		['1 Blech', { count: 1, unit: 'Blech' }],
		['2 Gläser à 400 ml', { count: 2, unit: 'Gläser' }],
		['6 servings', { count: 6, unit: 'Portionen' }],
		['ca. 20 Stk.', { count: 20, unit: 'Stück' }],
		['24 kleine Zimtschnecken', { count: 24, unit: 'kleine Zimtschnecken' }]
	])('%s', (value, expected) => {
		expect(parseYield(value)).toEqual(expected);
	});

	test('nothing without a number', () => {
		expect(parseYield('reichlich')).toBeUndefined();
		expect(parseYield(undefined)).toBeUndefined();
	});
});
