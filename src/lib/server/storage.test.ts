import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createLocalStorage, LOCAL_BLOB_URL_PREFIX } from './storage';

describe('local storage', () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), 'cookbook-storage-'));
	});
	afterEach(() => rm(dir, { recursive: true, force: true }));

	test('stores, serves and deletes files', async () => {
		const storage = createLocalStorage(dir);
		const url = await storage.putFile('recipes/a/1.webp', Buffer.from('image'), 'image/webp');

		expect(url).toBe(`${LOCAL_BLOB_URL_PREFIX}recipes/a/1.webp`);
		expect(await readFile(path.join(dir, 'recipes/a/1.webp'), 'utf8')).toBe('image');

		await storage.deleteFiles([url]);
		await expect(readFile(path.join(dir, 'recipes/a/1.webp'))).rejects.toThrow();
	});

	test('rejects paths outside the storage directory', async () => {
		const storage = createLocalStorage(dir);
		await expect(storage.putFile('../escape.txt', Buffer.from(''), 'text/plain')).rejects.toThrow();
	});
});
