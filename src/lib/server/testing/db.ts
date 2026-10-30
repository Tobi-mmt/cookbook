import { randomBytes } from 'node:crypto';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll } from 'vitest';
import { createDb, type Database } from '../db/client';

const adminUrl = process.env.TEST_POSTGRES_URL;

/** Tests against a real Postgres only run when TEST_POSTGRES_URL points to a server */
export const hasTestDatabase = Boolean(adminUrl);

/** A fresh, migrated database for one test file, dropped afterwards */
export const useTestDatabase = () => {
	const name = `test_${randomBytes(6).toString('hex')}`;
	const handle = {} as { db: Database };
	let close: (() => Promise<void>) | undefined;

	const admin = async (query: string) => {
		const client = new pg.Client({ connectionString: adminUrl });
		await client.connect();
		await client.query(query);
		await client.end();
	};

	beforeAll(async () => {
		await admin(`create database ${name}`);
		const url = new URL(adminUrl!);
		url.pathname = `/${name}`;
		const { db, pool } = createDb(url.href);
		// dropping the database below ends connections that are still closing
		pool.on('connect', (client) =>
			client.on('error', (error: Error & { code?: string }) => {
				if (error.code !== '57P01') console.error(error);
			})
		);
		await migrate(db, { migrationsFolder: 'drizzle' });
		handle.db = db;
		close = () => pool.end();
	}, 60_000);

	afterAll(async () => {
		await close?.();
		await admin(`drop database if exists ${name} with (force)`);
	});

	return handle;
};
