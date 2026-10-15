import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { copy, del, put } from '@vercel/blob';

export interface Storage {
	putFile(pathname: string, body: Buffer, contentType: string): Promise<string>;
	deleteFiles(urls: string[]): Promise<void>;
	/** copies a stored file to a new path and returns its URL */
	copyFile(url: string, pathname: string): Promise<string>;
}

export const LOCAL_BLOB_DIR = path.resolve('.data/blob');
export const LOCAL_BLOB_URL_PREFIX = '/dev-blob/';

const blobOptions = (token: string) => ({
	access: 'public' as const,
	token,
	addRandomSuffix: false,
	allowOverwrite: true,
	cacheControlMaxAge: 60 * 60 * 24 * 365
});

/** Vercel Blob, used in production and preview */
export const createBlobStorage = (token: string): Storage => ({
	async putFile(pathname, body, contentType) {
		const blob = await put(pathname, body, { ...blobOptions(token), contentType });
		return blob.url;
	},
	async deleteFiles(urls) {
		if (urls.length) await del(urls, { token });
	},
	async copyFile(url, pathname) {
		return (await copy(url, pathname, blobOptions(token))).url;
	}
});

/** Stores files on disk for local development, served by `src/routes/dev-blob` */
export const createLocalStorage = (baseDir = LOCAL_BLOB_DIR): Storage => {
	const resolveSafe = (pathname: string) => {
		const filePath = path.resolve(baseDir, pathname);
		if (!filePath.startsWith(baseDir + path.sep)) throw new Error(`Invalid path: ${pathname}`);
		return filePath;
	};

	return {
		async putFile(pathname, body) {
			const filePath = resolveSafe(pathname);
			await mkdir(path.dirname(filePath), { recursive: true });
			await writeFile(filePath, body);
			return LOCAL_BLOB_URL_PREFIX + pathname;
		},
		async deleteFiles(urls) {
			for (const url of urls) {
				if (!url.startsWith(LOCAL_BLOB_URL_PREFIX)) continue;
				await rm(resolveSafe(url.slice(LOCAL_BLOB_URL_PREFIX.length)), { force: true });
			}
		},
		async copyFile(url, pathname) {
			const body = await readFile(resolveSafe(url.slice(LOCAL_BLOB_URL_PREFIX.length)));
			return this.putFile(pathname, body, '');
		}
	};
};

export const readLocalFile = (pathname: string, baseDir = LOCAL_BLOB_DIR) => {
	const filePath = path.resolve(baseDir, pathname);
	if (!filePath.startsWith(baseDir + path.sep)) throw new Error(`Invalid path: ${pathname}`);
	return readFile(filePath);
};

export const createStorage = (blobToken: string | undefined): Storage =>
	blobToken ? createBlobStorage(blobToken) : createLocalStorage();
