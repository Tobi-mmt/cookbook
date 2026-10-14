import { describe, expect, test } from 'vitest';
import type { Category, NutritionType } from '../types';
import { filterRecipes } from './recipeFilter';

const recipe = (title: string, category: Category, nutritionType: NutritionType) => ({
	title,
	meta: { category, nutritionType }
});

const recipes = [
	recipe('Dal', 'Herzhaft', 'Vegan'),
	recipe('Lasagne', 'Herzhaft', 'Fleisch'),
	recipe('Quiche', 'Herzhaft', 'Vegetarisch'),
	recipe('Kartoffelsalat', 'Salat', 'Vegetarisch')
];

const titles = (filtered: { title: string }[]) => filtered.map(({ title }) => title);

describe('filterRecipes', () => {
	test('returns all recipes without a filter', () => {
		expect(filterRecipes(recipes, {})).toEqual(recipes);
	});

	test('filters by category', () => {
		expect(titles(filterRecipes(recipes, { category: 'Salat' }))).toEqual(['Kartoffelsalat']);
	});

	test('counts vegan recipes as vegetarian', () => {
		expect(titles(filterRecipes(recipes, { diet: 'Vegetarisch' }))).toEqual([
			'Dal',
			'Quiche',
			'Kartoffelsalat'
		]);
		expect(titles(filterRecipes(recipes, { diet: 'Vegan' }))).toEqual(['Dal']);
	});

	test('combines category and diet', () => {
		expect(titles(filterRecipes(recipes, { category: 'Herzhaft', diet: 'Vegetarisch' }))).toEqual([
			'Dal',
			'Quiche'
		]);
	});
});
