import { and, count, desc, eq, exists, ilike, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getDb } from '#lib/server/context.js';
import { cookbooks, ingredients, recipes, users } from '#lib/server/db/schema.js';
import { PAGE_SIZE, pageOffset, pagination, readPage } from '#lib/server/pagination.js';

const owners = alias(users, 'owners');
const authors = alias(users, 'authors');

/** Also hidden and deleted recipes, searchable by title, ingredient, cookbook and person */
export async function load({ url }) {
	const query = (url.searchParams.get('q') ?? '').trim();
	const person = (url.searchParams.get('person') ?? '').trim().replace(/^@/, '').toLowerCase();
	const cookbook = (url.searchParams.get('kochbuch') ?? '').trim();
	const like = (value: string) => `%${value.replace(/[%_]/g, '\\$&')}%`;
	const db = getDb();

	const page = readPage(url);
	const where = and(
		query
			? or(
					ilike(recipes.title, like(query)),
					exists(
						db
							.select({ id: ingredients.id })
							.from(ingredients)
							.where(
								and(eq(ingredients.recipeId, recipes.id), ilike(ingredients.name, like(query)))
							)
					)
				)
			: undefined,
		person ? or(eq(authors.username, person), eq(owners.username, person)) : undefined,
		cookbook ? ilike(cookbooks.name, like(cookbook)) : undefined
	);
	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: recipes.id,
				title: recipes.title,
				cookbook: cookbooks.name,
				owner: owners.username,
				author: authors.username,
				hidden: sql<boolean>`${recipes.hiddenAt} is not null`,
				deleted: sql<boolean>`${recipes.deletedAt} is not null`,
				createdAt: recipes.createdAt
			})
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.innerJoin(owners, eq(owners.id, cookbooks.ownerId))
			.leftJoin(authors, eq(authors.id, recipes.createdBy))
			.where(where)
			.orderBy(desc(recipes.createdAt))
			.limit(PAGE_SIZE)
			.offset(pageOffset(page)),
		db
			.select({ total: count() })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.innerJoin(owners, eq(owners.id, cookbooks.ownerId))
			.leftJoin(authors, eq(authors.id, recipes.createdBy))
			.where(where)
	]);
	return {
		query,
		person,
		cookbook,
		recipes: rows,
		pagination: pagination(page, rows.length, total)
	};
}
