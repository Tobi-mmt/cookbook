import { writable } from 'svelte/store';
import type { RecipeIndexEntry } from '../types';

/** All recipes for the search, loaded once in the browser when the search is about to be used */
export const recipeIndex = writable<RecipeIndexEntry[]>([]);

/** Opened by the top bar and the search field on the home page */
export const searchOpen = writable(false);

let loading: Promise<void> | undefined;

export const loadRecipeIndex = () =>
	(loading ??= fetch('/api/recipe-index.json')
		.then((response) => {
			if (!response.ok) throw new Error(`Loading recipes failed: ${response.status}`);
			return response.json();
		})
		.then(recipeIndex.set)
		.catch((error) => {
			loading = undefined;
			console.error(error);
		}));
