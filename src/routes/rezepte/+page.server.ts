import { getDb } from '#lib/server/context.js';
import { listIngredientLandings, listLandings } from '#lib/server/landings.js';

export const config = { isr: { expiration: 3600 } };

export async function load() {
	const db = getDb();
	const [landings, ingredients] = await Promise.all([listLandings(db), listIngredientLandings(db)]);
	return { landings, ingredients };
}
