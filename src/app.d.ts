import type { RecipeFilter } from '#lib/recipeFilter.js';
import type { Session } from '#lib/server/auth/session.js';

declare global {
	namespace App {
		interface Locals {
			/** reads the session on the first call, see `src/hooks.server.ts` */
			getSession: () => Promise<Session | null>;
		}
		/** kept in the history entry, so that the filter is restored when going back */
		interface PageState {
			filter?: RecipeFilter;
		}
	}
}

export {};
