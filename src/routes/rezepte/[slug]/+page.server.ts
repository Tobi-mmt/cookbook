import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/context.js';
import { listLandings, loadLanding } from '#lib/server/landings.js';

export const config = { isr: { expiration: 3600 } };

export async function load({ params }) {
	const db = getDb();
	const [landing, landings] = await Promise.all([loadLanding(db, params.slug), listLandings(db)]);
	if (!landing?.recipes.length) error(404, 'Keine Rezepte gefunden');
	return { landing, others: landings.filter(({ slug }) => slug !== params.slug) };
}
