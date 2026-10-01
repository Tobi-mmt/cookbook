import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from '../src/lib/server/db/client';

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const { db, pool } = createDb(process.env.DATABASE_URL);
await migrate(db, { migrationsFolder: 'drizzle' });
await pool.end();
console.log('Database migrated');
