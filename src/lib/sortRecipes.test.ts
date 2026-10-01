import { describe, expect, test } from 'vitest';
import { categorize } from './categorizedRecipes';
import { sortRecipes } from './sortRecipes';
import type { Category } from '../types';

const recipe = (title: string, category: Category) => ({ title, meta: { category } });

describe('sortRecipes', () => {
	test('sorts by category order and then by title', () => {
		const sorted = sortRecipes([
			recipe('Kuchen', 'Süßspeise'),
			recipe('Suppe', 'Herzhaft'),
			recipe('Bowle', 'Getränke'),
			recipe('Dal', 'Herzhaft'),
			recipe('Kartoffelsalat', 'Salat')
		]);
		expect(sorted.map(({ title }) => title)).toEqual([
			'Kartoffelsalat',
			'Dal',
			'Suppe',
			'Kuchen',
			'Bowle'
		]);
	});
});

describe('categorize', () => {
	test('groups recipes by category and keeps empty categories', () => {
		const result = categorize([recipe('Dal', 'Herzhaft'), recipe('Suppe', 'Herzhaft')]);
		expect(result.Herzhaft.map(({ title }) => title)).toEqual(['Dal', 'Suppe']);
		expect(result.Salat).toEqual([]);
	});
});
