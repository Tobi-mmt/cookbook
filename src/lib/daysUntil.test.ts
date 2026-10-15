import { expect, test } from 'vitest';
import { daysUntil, inDays } from './daysUntil';

const DAY = 24 * 60 * 60 * 1000;

test('daysUntil rounds up and never gets negative', () => {
	expect(daysUntil(new Date(7 * DAY), 0)).toBe(7);
	expect(daysUntil(new Date(6.2 * DAY), 0)).toBe(7);
	expect(daysUntil(new Date(0), DAY)).toBe(0);
});

test('inDays', () => {
	expect([0, 1, 5].map(inDays)).toEqual(['heute', 'morgen', 'in 5 Tagen']);
});
