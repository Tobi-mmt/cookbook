/**
 * How long a recipe counts as new. New recipes come every one to three months, and most visitors
 * come back every few weeks, so six weeks lets them notice a recipe while rarely more than two
 * recipes are new at the same time.
 */
export const NEW_RECIPE_DAYS = 42;

export const isNewRecipe = (createdAt: Date, now = new Date()) =>
	now.getTime() - createdAt.getTime() < NEW_RECIPE_DAYS * 24 * 60 * 60 * 1000;
