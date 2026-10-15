import { randomBytes } from 'node:crypto';

/** 15 hex chars, same format as the former `yarn get-random-id` */
export const createId = () => randomBytes(8).toString('hex').slice(0, 15);
