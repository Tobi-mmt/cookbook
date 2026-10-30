import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

const VERIFY_FULL_ALIASES = ['prefer', 'require', 'verify-ca'];

export const withExplicitSslMode = (connectionString: string) => {
	const url = new URL(connectionString);
	const mode = url.searchParams.get('sslmode');
	if (!mode || !VERIFY_FULL_ALIASES.includes(mode)) return connectionString;
	url.searchParams.set('sslmode', 'verify-full');
	return url.toString();
};

export const createDb = (connectionString: string) => {
	const pool = new pg.Pool({ connectionString: withExplicitSslMode(connectionString), max: 5 });
	// Neon closes idle connections when it suspends, the pool then opens a new one
	pool.on('error', (error) => console.warn('Idle database connection closed:', error.message));
	return { db: drizzle(pool, { schema }), pool };
};
