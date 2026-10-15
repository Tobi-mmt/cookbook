import type { RecipeRow } from '../server/db/schema';

export const testRecipeRow = (overrides: Partial<RecipeRow> = {}): RecipeRow => ({
	id: 'abc',
	title: 'Rezept',
	description: null,
	portion: 2,
	duration: 30,
	categoryId: 5,
	nutritionType: 'Vegetarisch',
	image: null,
	sourceUrl: null,
	cookbookId: 'cookbook',
	createdBy: 'user',
	updatedBy: 'user',
	version: 1,
	copiedFromId: null,
	attribution: [],
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	deletedBy: null,
	hiddenAt: null,
	hiddenReason: null,
	...overrides
});
