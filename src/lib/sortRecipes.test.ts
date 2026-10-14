import { describe, expect, test } from 'vitest';
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
