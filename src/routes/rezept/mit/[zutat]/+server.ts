import { redirect } from '@sveltejs/kit';

export function GET({ params }) {
	redirect(308, `/rezepte/mit/${encodeURIComponent(params.zutat)}`);
}
