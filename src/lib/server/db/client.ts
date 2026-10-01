import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

export const createDb = (connectionString: string) => {
	const pool = new pg.Pool({ connectionString, max: 5 });
	return { db: drizzle(pool, { schema }), pool };
};
