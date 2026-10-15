import type { Session } from '#lib/server/auth/session.js';

declare global {
	namespace App {
		interface Locals {
			/** reads the session on the first call, see `src/hooks.server.ts` */
			getSession: () => Promise<Session | null>;
		}
	}
}

export {};
