import { describe, expect, test } from 'vitest';
import { sortRecipes } from './sortRecipes';
import type { Category } from '../types';
import { testCategories } from './testing/categories';

const { backen, getraenke, hauptgericht, salat } = testCategories;

const recipe = (title: string, category: Category) => ({ title, meta: { category } });

describe('sortRecipes', () => {
	test('sorts by category position and then by title', () => {
		const sorted = sortRecipes([
			recipe('Kuchen', backen),
			recipe('Suppe', hauptgericht),
			recipe('Bowle', getraenke),
			recipe('Dal', hauptgericht),
			recipe('Kartoffelsalat', salat)
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
