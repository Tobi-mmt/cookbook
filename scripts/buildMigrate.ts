/**
 * Runs the database migrations during the Vercel build.
 * Preview deployments only migrate with MIGRATE_ON_PREVIEW=1, because a preview
 * must not change the schema of a database that production still uses.
 */
const { VERCEL_ENV, MIGRATE_ON_PREVIEW } = process.env;

if (VERCEL_ENV === 'production' || (VERCEL_ENV === 'preview' && MIGRATE_ON_PREVIEW === '1')) {
	await import('./dbMigrate');
} else {
	console.log(`Skipping database migration (VERCEL_ENV=${VERCEL_ENV ?? 'unset'})`);
}
