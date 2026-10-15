import type { Ingredient, Recipe, Section, Step } from '../../../types';
import { isNewRecipe } from '../../newRecipe';
import type { RecipeInput } from '../../recipeInput';
import type { CategoryRow, IngredientRow, RecipeRow, StepIngredientRow, StepRow } from './schema';

export interface RecipeRows {
	recipe: RecipeRow;
	category: CategoryRow;
	ingredients: IngredientRow[];
	steps: StepRow[];
	stepIngredients: StepIngredientRow[];
	context: Pick<Recipe, 'cookbook' | 'author' | 'attribution'> & { hiddenCookbook: boolean };
}

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

const toIngredient = (row: IngredientRow): Ingredient => {
	const ingredient: Ingredient = { name: row.name, key: String(row.id) };
	if (row.quantity != null) ingredient.quantity = row.quantity;
	if (row.unit) ingredient.unit = row.unit;
	return ingredient;
};

/** Maps the database rows of one recipe to the `Recipe` shape used by the frontend */
export const mapRecipe = (
	{ recipe, category, ingredients, steps, stepIngredients, context }: RecipeRows,
	now = new Date()
): Recipe => {
	const ingredientsById = new Map(ingredients.map((row) => [row.id, row]));

	return {
		id: recipe.id,
		title: recipe.title,
		...(recipe.description ? { description: recipe.description } : {}),
		...(recipe.sourceUrl ? { sourceUrl: recipe.sourceUrl } : {}),
		cookbook: context.cookbook,
		author: context.author,
		attribution: context.attribution,
		updatedAt: recipe.updatedAt,
		isUnchangedCopy: Boolean(recipe.copiedFromId) && recipe.version === 1,
		meta: {
			portion: recipe.portion,
			duration: recipe.duration,
			category,
			nutritionType: recipe.nutritionType
		},
		image: recipe.image ?? null,
		isNew: isNewRecipe(recipe.createdAt, now),
		ingredients: [...ingredients]
			.sort(byPosition)
			.map((row): Ingredient | Section =>
				row.kind === 'section' ? { section: row.name, key: String(row.id) } : toIngredient(row)
			),
		steps: [...steps].sort(byPosition).map((row): Step | Section => {
			if (row.kind === 'section') return { section: row.text };
			const linked = stepIngredients
				.filter((link) => link.stepId === row.id)
				.sort(byPosition)
				.flatMap((link) => {
					const ingredient = ingredientsById.get(link.ingredientId);
					if (!ingredient) return [];
					return [toIngredient({ ...ingredient, quantity: link.quantity ?? ingredient.quantity })];
				});
			return linked.length
				? { description: row.text, linkedIngredients: linked }
				: { description: row.text };
		})
	};
};

/** Maps the database rows to the editable form state of the admin editor */
export const mapRecipeInput = ({
	recipe,
	ingredients,
	steps,
	stepIngredients
}: RecipeRows): RecipeInput => ({
	title: recipe.title,
	description: recipe.description,
	sourceUrl: recipe.sourceUrl,
	portion: recipe.portion,
	duration: recipe.duration,
	categoryId: recipe.categoryId,
	nutritionType: recipe.nutritionType,
	ingredients: [...ingredients].sort(byPosition).map((row) => ({
		clientId: String(row.id),
		kind: row.kind,
		name: row.name,
		quantity: row.quantity,
		unit: row.unit
	})),
	steps: [...steps].sort(byPosition).map((row) => ({
		kind: row.kind,
		text: row.text,
		links: stepIngredients
			.filter((link) => link.stepId === row.id)
			.sort(byPosition)
			.map((link) => ({ ingredientId: String(link.ingredientId), quantity: link.quantity }))
	}))
});
