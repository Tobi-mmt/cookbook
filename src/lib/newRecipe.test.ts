import { describe, expect, test } from 'vitest';
import { isNewRecipe, NEW_RECIPE_DAYS } from './newRecipe';

const DAY = 24 * 60 * 60 * 1000;

describe('isNewRecipe', () => {
	const now = new Date('2026-10-14T12:00:00Z');

	test('is new for six weeks', () => {
		expect(isNewRecipe(now, now)).toBe(true);
		expect(isNewRecipe(new Date(now.getTime() - (NEW_RECIPE_DAYS - 1) * DAY), now)).toBe(true);
	});

	test('is no longer new afterwards', () => {
		expect(isNewRecipe(new Date(now.getTime() - NEW_RECIPE_DAYS * DAY), now)).toBe(false);
		expect(isNewRecipe(new Date('2020-04-10T19:09:52+02:00'), now)).toBe(false);
	});
});
