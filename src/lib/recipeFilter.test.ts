import { describe, expect, test } from 'vitest';
import type { Category, NutritionType } from '../types';
import { filterRecipes, presentCategories } from './recipeFilter';
import { testCategories } from './testing/categories';

const { hauptgericht, salat } = testCategories;

const recipe = (title: string, category: Category, nutritionType: NutritionType) => ({
	title,
	meta: { category, nutritionType }
});

const recipes = [
	recipe('Dal', hauptgericht, 'Vegan'),
	recipe('Lasagne', hauptgericht, 'Fleisch'),
	recipe('Quiche', hauptgericht, 'Vegetarisch'),
	recipe('Kartoffelsalat', salat, 'Vegetarisch'),
	recipe('Lachs', hauptgericht, 'Fisch')
];

const titles = (filtered: { title: string }[]) => filtered.map(({ title }) => title);

describe('filterRecipes', () => {
	test('returns all recipes without a filter', () => {
		expect(filterRecipes(recipes, {})).toEqual(recipes);
	});

	test('filters by category', () => {
		expect(titles(filterRecipes(recipes, { category: 'salat' }))).toEqual(['Kartoffelsalat']);
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
		expect(
			titles(filterRecipes(recipes, { category: 'hauptgericht', diet: 'Vegetarisch' }))
		).toEqual(['Dal', 'Quiche']);
	});
});

describe('presentCategories', () => {
	test('returns each category of the recipes once, in their order', () => {
		expect(presentCategories(recipes)).toEqual([salat, hauptgericht]);
	});
});
