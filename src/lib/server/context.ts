import { env } from '$env/dynamic/private';
import { createStorage } from './storage';

export { getDb } from './db';

export const getStorage = () => createStorage(env.BLOB_READ_WRITE_TOKEN);
