/**
 * Uploads the images of a backup back to Vercel Blob, see the README:
 *
 *   BLOB_READ_WRITE_TOKEN=… yarn restore:images <folder> [--overwrite] [--dry-run]
 *   BLOB_READ_WRITE_TOKEN=… POSTGRES_URL=… yarn restore:images <folder> --rewrite-urls
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { list, put } from '@vercel/blob';
import { sql } from 'drizzle-orm';
import { createDb } from '../src/lib/server/db/client';

const CONTENT_TYPES: Record<string, string> = {
	'.avif': 'image/avif',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png'
};
const BLOB_BASE = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//;
const URL_COLUMNS = [
	['recipes', 'image'],
	['recipe_versions', 'snapshot'],
	['report_cases', 'snapshot'],
	['admin_audit_log', 'before'],
	['admin_audit_log', 'after']
] as const;

const args = process.argv.slice(2);
const folder = args.find((arg) => !arg.startsWith('--'));
const overwrite = args.includes('--overwrite');
const dryRun = args.includes('--dry-run');
const rewriteUrls = args.includes('--rewrite-urls');
const { BLOB_READ_WRITE_TOKEN: token, POSTGRES_URL } = process.env;

if (!token || !folder || (rewriteUrls && !POSTGRES_URL)) {
	console.error(
		'Usage: BLOB_READ_WRITE_TOKEN=… [POSTGRES_URL=…] yarn restore:images <folder> [--overwrite] [--dry-run] [--rewrite-urls]'
	);
	process.exit(1);
}

const filesIn = async (directory: string): Promise<string[]> => {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map((entry) => {
			const full = path.join(directory, entry.name);
			return entry.isDirectory() ? filesIn(full) : [full];
		})
	);
	return nested.flat();
};

const existingPathnames = async () => {
	const pathnames = new Set<string>();
	let cursor: string | undefined;
	do {
		const page = await list({ token, cursor, limit: 1000 });
		for (const blob of page.blobs) pathnames.add(blob.pathname);
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);
	return pathnames;
};

const files = await filesIn(folder);
const existing = overwrite ? new Set<string>() : await existingPathnames();
let uploaded = 0;
let skipped = 0;
let newBase: string | undefined;

for (const file of files) {
	const pathname = path.relative(folder, file).split(path.sep).join('/');
	if (existing.has(pathname)) {
		skipped++;
		continue;
	}
	if (dryRun) {
		console.log(`would upload ${pathname}`);
		uploaded++;
		continue;
	}
	const blob = await put(pathname, await readFile(file), {
		access: 'public',
		token,
		addRandomSuffix: false,
		allowOverwrite: true,
		cacheControlMaxAge: 60 * 60 * 24 * 365,
		contentType: CONTENT_TYPES[path.extname(file).toLowerCase()]
	});
	newBase ??= blob.url.slice(0, blob.url.length - pathname.length);
	uploaded++;
	if (uploaded % 100 === 0) console.log(`${uploaded} uploaded`);
}
console.log(
	`${uploaded} ${dryRun ? 'to upload' : 'uploaded'}, ${skipped} already there, ${files.length} in the backup`
);

if (rewriteUrls) {
	const { db, pool } = createDb(POSTGRES_URL!);
	newBase ??= (await list({ token, limit: 1 })).blobs[0]?.url.match(BLOB_BASE)?.[0];
	const sample = await db.execute<{ url: string }>(
		sql`select image->'variants'->'avif'->0->>'url' as url from recipes where image is not null limit 1`
	);
	const oldBase = sample.rows[0]?.url.match(BLOB_BASE)?.[0];
	if (!newBase || !oldBase) {
		console.error('The store addresses could not be determined, nothing was changed.');
	} else if (oldBase === newBase) {
		console.log(`The database already points to ${newBase}, nothing to rewrite.`);
	} else {
		console.log(`Rewriting ${oldBase} → ${newBase}${dryRun ? ' (dry run)' : ''}`);
		for (const [table, column] of URL_COLUMNS) {
			const where = sql`${sql.identifier(column)}::text like ${`%${oldBase}%`}`;
			const result = dryRun
				? await db.execute(sql`select 1 from ${sql.identifier(table)} where ${where}`)
				: await db.execute(
						sql`update ${sql.identifier(table)} set ${sql.identifier(column)} = replace(${sql.identifier(column)}::text, ${oldBase}, ${newBase})::jsonb where ${where}`
					);
			console.log(`${table}.${column}: ${result.rowCount} rows`);
		}
	}
	await pool.end();
}
