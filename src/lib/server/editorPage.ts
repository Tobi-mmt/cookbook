import type { RequestEvent } from '@sveltejs/kit';
import type { RecipeInput } from '../recipeInput';
import { requireUser } from './auth/guards';
import { listCategories } from './categories';
import { getDb } from './context';
import { listEditableCookbooks } from './cookbooks';

/** Data for creating a recipe, in the cookbook from `?kochbuch=` or the own one */
export const loadNewRecipePage = async (event: RequestEvent) => {
	const user = await requireUser(event);
	const db = getDb();
	const [cookbooks, categories] = await Promise.all([
		listEditableCookbooks(db, user.id),
		listCategories(db)
	]);
	const requested = cookbooks.find(({ id }) => id === event.url.searchParams.get('kochbuch'));
	const cookbookId = requested?.id ?? cookbooks[0]?.id;

	const recipe: RecipeInput = {
		title: '',
		description: null,
		sourceUrl: null,
		portion: 2,
		duration: 30,
		categoryId: (categories.find(({ slug }) => slug === 'hauptgericht') ?? categories[0]).id,
		nutritionType: 'Vegetarisch',
		ingredients: [],
		steps: [{ kind: 'step', text: '', links: [] }]
	};
	return {
		recipe,
		categories,
		cookbookId,
		/** back to the cookbook the person came from, otherwise to their profile */
		cancelHref: requested ? `/@${requested.ownerUsername}/${requested.slug}` : `/@${user.username}`,
		cookbooks: cookbooks.map(({ id, name, ownerUsername, role }) => ({
			id,
			name: role === 'owner' ? name : `${name} (@${ownerUsername})`
		}))
	};
};
