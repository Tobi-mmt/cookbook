import { attachDatabasePool } from '@vercel/functions';
import { env } from '$env/dynamic/private';
import { createDb, type Database } from './client';

let database: Database | undefined;

/** Lazily creates the shared connection pool, so that builds work without a database */
export const getDb = (): Database => {
	if (!database) {
		if (!env.POSTGRES_URL) throw new Error('POSTGRES_URL is not set');
		const { db, pool } = createDb(env.POSTGRES_URL);
		// lets Vercel Fluid compute close idle connections before a function gets suspended
		attachDatabasePool(pool);
		database = db;
	}
	return database;
};
