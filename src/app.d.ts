import type { RecipeFilter } from '#lib/recipeFilter.js';

declare global {
	namespace App {
		/** kept in the history entry, so that the filter is restored when going back */
		interface PageState {
			filter?: RecipeFilter;
		}
	}
}

export {};
