import type { Category, Ingredient, Recipe, RecipeImage, Section, Step } from '../types';
import type { RecipeInput } from './recipeInput';

/** Shows a stored version like a recipe, `base` provides what a version does not store */
export const recipeFromInput = (
	input: RecipeInput,
	image: RecipeImage | null,
	category: Category,
	base: Omit<
		Recipe,
		'title' | 'meta' | 'image' | 'description' | 'sourceUrl' | 'ingredients' | 'steps'
	>
): Recipe => {
	const ingredientsById = new Map(input.ingredients.map((item) => [item.clientId, item]));
	const toIngredient = (
		item: RecipeInput['ingredients'][number],
		quantity = item.quantity
	): Ingredient => ({
		name: item.name,
		key: item.clientId,
		...(quantity != null ? { quantity } : {}),
		...(item.unit ? { unit: item.unit } : {})
	});

	return {
		...base,
		title: input.title,
		...(input.description ? { description: input.description } : {}),
		...(input.sourceUrl ? { sourceUrl: input.sourceUrl } : {}),
		image,
		meta: {
			portion: input.portion,
			duration: input.duration,
			category,
			nutritionType: input.nutritionType
		},
		ingredients: input.ingredients.map((item): Ingredient | Section =>
			item.kind === 'section' ? { section: item.name, key: item.clientId } : toIngredient(item)
		),
		steps: input.steps.map((step): Step | Section => {
			if (step.kind === 'section') return { section: step.text };
			const linked = step.links.flatMap((link) => {
				const item = ingredientsById.get(link.ingredientId);
				return item ? [toIngredient(item, link.quantity ?? item.quantity)] : [];
			});
			return linked.length
				? { description: step.text, linkedIngredients: linked }
				: { description: step.text };
		})
	};
};
