import { getDb } from '#lib/server/context.js';
import { loadHome } from '#lib/server/home.js';
import { listIngredientLandings, listLandings } from '#lib/server/landings.js';
import { isrConfig } from '#lib/server/isr.js';

export const config = isrConfig;

export async function load() {
	const db = getDb();
	const [home, landings, ingredients] = await Promise.all([
		loadHome(db),
		listLandings(db),
		listIngredientLandings(db)
	]);
	return { ...home, landings, ingredients: ingredients.slice(0, 12) };
}
