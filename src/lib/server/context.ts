import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
import { createStorage } from './storage';

export { getDb } from './db';

export const getStorage = () => createStorage(BLOB_READ_WRITE_TOKEN);
