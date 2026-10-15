import { asc } from 'drizzle-orm';
import type { Category } from '../../types';
import type { Database } from './db/client';
import { categories } from './db/schema';

export const listCategories = (db: Database): Promise<Category[]> =>
	db.select().from(categories).orderBy(asc(categories.position));

export const categoriesById = async (db: Database) =>
	new Map((await listCategories(db)).map((category) => [category.id, category]));
