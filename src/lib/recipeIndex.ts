import { writable } from 'svelte/store';
import type { RecipeIndexEntry } from '../types';

/** All recipes for the menu and the search, loaded once in the browser */
export const recipeIndex = writable<RecipeIndexEntry[]>([]);

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
