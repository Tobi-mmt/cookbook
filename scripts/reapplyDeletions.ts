/**
 * Deletes the accounts of `deletion_log` again after a backup was restored, so that no deleted
 * account comes back (GDPR):
 *
 *   POSTGRES_URL=<restored database> yarn db:reapply-deletions
 */
import { eq } from 'drizzle-orm';
import { deleteAccount } from '../src/lib/server/accounts';
import { createDb } from '../src/lib/server/db/client';
import { deletionLog, users } from '../src/lib/server/db/schema';
import { createStorage } from '../src/lib/server/storage';

const { POSTGRES_URL, BLOB_READ_WRITE_TOKEN } = process.env;
if (!POSTGRES_URL) {
	console.error('POSTGRES_URL must be set');
	process.exit(1);
}

const { db, pool } = createDb(POSTGRES_URL);
const storage = createStorage(BLOB_READ_WRITE_TOKEN);
let deleted = 0;
for (const { userId } of await db.select().from(deletionLog)) {
	if (!(await db.query.users.findFirst({ where: eq(users.id, userId) }))) continue;
	await deleteAccount(db, storage, userId);
	deleted++;
}
await pool.end();
console.log(`${deleted} accounts deleted again`);
