import type { RecipeInput } from '#lib/recipeInput.js';
import { saveRecipeAction } from '#lib/server/adminActions.js';
import { listCategories } from '#lib/server/categories.js';
import { getDb } from '#lib/server/context.js';

export async function load() {
	const categories = await listCategories(getDb());
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
	return { recipe, image: null, categories };
}

export const actions = {
	default: (event) => saveRecipeAction(event)
};
