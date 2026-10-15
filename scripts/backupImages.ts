/**
 * Downloads all files of Vercel Blob into a folder, for the weekly backup:
 *
 *   BLOB_READ_WRITE_TOKEN=… yarn backup:images <folder>
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { list } from '@vercel/blob';

const { BLOB_READ_WRITE_TOKEN: token } = process.env;
const folder = process.argv[2];
if (!token || !folder) {
	console.error('Usage: BLOB_READ_WRITE_TOKEN=… yarn backup:images <folder>');
	process.exit(1);
}

let cursor: string | undefined;
let count = 0;
do {
	const page = await list({ token, cursor, limit: 1000 });
	for (const blob of page.blobs) {
		const target = path.join(folder, blob.pathname);
		const response = await fetch(blob.url);
		if (!response.ok) throw new Error(`Downloading ${blob.pathname} failed: ${response.status}`);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, Buffer.from(await response.arrayBuffer()));
		count++;
	}
	cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);
console.log(`${count} files downloaded`);
