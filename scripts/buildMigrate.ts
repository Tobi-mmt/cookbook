/**
 * Runs the database migrations during the Vercel build.
 * Preview deployments have their own database branch, so they migrate as well.
 */
const { VERCEL_ENV } = process.env;

if (VERCEL_ENV === 'production' || VERCEL_ENV === 'preview') {
	await import('./dbMigrate');
} else {
	console.log(`Skipping database migration (VERCEL_ENV=${VERCEL_ENV ?? 'unset'})`);
}
