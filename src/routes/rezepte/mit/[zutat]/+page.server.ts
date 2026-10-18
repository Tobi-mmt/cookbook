import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/context.js';
import {
	listIngredientLandings,
	listLandings,
	loadIngredientLanding
} from '#lib/server/landings.js';

export const config = { isr: { expiration: 3600 } };

export async function load({ params }) {
	const db = getDb();
	const [landing, landings, ingredients] = await Promise.all([
		loadIngredientLanding(db, params.zutat),
		listLandings(db),
		listIngredientLandings(db)
	]);
	if (!landing?.recipes.length) error(404, 'Keine Rezepte gefunden');
	return {
		landing,
		others: landings,
		ingredients: ingredients.filter(({ slug }) => slug !== params.zutat).slice(0, 30)
	};
}
