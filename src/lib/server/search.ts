import { and, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { Database } from './db/client';
import { categories, cookbooks, ingredients, recipes, users } from './db/schema';
import { isVisible } from './recipes';

const MIN_SCORE = 0.35;
const authors = alias(users, 'authors');

export type SearchResult = {
	id: string;
	title: string;
	category: { name: string; color: string };
	author: string | null;
};

/**
 * Searches all visible recipes by title and ingredient. Trigram word similarity tolerates
 * typos, a matching ingredient counts a little less than a matching title.
 */
export const searchRecipes = async (db: Database, query: string, limit = 20) => {
	const term = query.trim().toLowerCase().slice(0, 100);
	if (term.length < 2) return [];

	const ingredientScore = sql`(
		select max(word_similarity(${term}, lower(${ingredients.name})))
		from ${ingredients}
		where ${ingredients.recipeId} = ${recipes.id} and ${ingredients.kind} = 'ingredient'
	)`;
	const score = sql<number>`greatest(
		word_similarity(${term}, lower(${recipes.title})),
		coalesce(${ingredientScore}, 0) * 0.8
	)`;

	const rows = await db
		.select({
			id: recipes.id,
			title: recipes.title,
			categoryName: categories.name,
			categoryColor: categories.color,
			author: authors.username,
			score
		})
		.from(recipes)
		.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
		.innerJoin(categories, eq(categories.id, recipes.categoryId))
		.leftJoin(authors, eq(authors.id, recipes.createdBy))
		.where(and(isVisible, sql`${score} >= ${MIN_SCORE}`))
		.orderBy(desc(score), recipes.title)
		.limit(limit);

	return rows.map(({ id, title, categoryName, categoryColor, author }): SearchResult => ({
		id,
		title,
		category: { name: categoryName, color: categoryColor },
		author
	}));
};
