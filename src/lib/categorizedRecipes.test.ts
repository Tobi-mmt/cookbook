import { describe, expect, test } from 'vitest';
import { categorizedRecipes } from './categorizedRecipes';

describe('categorizedRecipes', () => {
	test('all ingredients are used in the steps', () => {
		for (const category of Object.values(categorizedRecipes)) {
			for (const recipe of category) {
				const usedIngredients = new Set();

				for (const step of recipe.steps) {
					if ('linkedIngredients' in step) {
						for (const ingredient of step.linkedIngredients) {
							usedIngredients.add(ingredient.name);
						}
					}
				}

				for (const ingredient of recipe.ingredients) {
					if ('name' in ingredient) {
						expect(
							usedIngredients.has(ingredient.name),
							`Ingredient "${ingredient.name}" is missing in the steps in recipe "${recipe.title}".`
						).toBeTruthy();
					}
				}
			}
		}
	});
});
