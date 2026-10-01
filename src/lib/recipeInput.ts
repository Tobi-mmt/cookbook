import { z } from 'zod';

export const CATEGORIES = ['Salat', 'Herzhaft', 'Süßspeise', 'Getränke'] as const;
export const NUTRITION_TYPES = ['Vegan', 'Vegetarisch', 'Fleisch'] as const;

const trimmed = z.string().trim();

export const ingredientInputSchema = z.object({
	/** stable id within the editor, referenced by the steps */
	clientId: z.string().min(1),
	kind: z.enum(['ingredient', 'section']),
	name: trimmed.min(1, 'Name fehlt'),
	quantity: z.number().positive().nullable().optional(),
	unit: trimmed.nullable().optional()
});

export const stepInputSchema = z.object({
	kind: z.enum(['step', 'section']),
	text: trimmed.min(1, 'Text fehlt'),
	links: z
		.array(
			z.object({
				ingredientId: z.string(),
				/** only set when the step uses a different quantity than the ingredient list */
				quantity: z.number().positive().nullable().optional()
			})
		)
		.default([])
});

export const recipeInputSchema = z
	.object({
		title: trimmed.min(1, 'Titel fehlt'),
		description: trimmed.nullable().optional(),
		sourceUrl: z.preprocess(
			(value) => (typeof value === 'string' ? value.trim() || null : value),
			z
				.url({ protocol: /^https?$/, error: 'Ungültige Quell-URL' })
				.nullable()
				.optional()
		),
		portion: z.number().int().positive(),
		duration: z.number().int().positive(),
		category: z.enum(CATEGORIES),
		nutritionType: z.enum(NUTRITION_TYPES),
		ingredients: z.array(ingredientInputSchema),
		steps: z.array(stepInputSchema).min(1, 'Mindestens ein Schritt')
	})
	.superRefine((recipe, ctx) => {
		const ingredientIds = new Set(
			recipe.ingredients.filter((i) => i.kind === 'ingredient').map((i) => i.clientId)
		);
		recipe.steps.forEach((step, index) => {
			for (const { ingredientId } of step.links) {
				if (!ingredientIds.has(ingredientId)) {
					ctx.addIssue({
						code: 'custom',
						message: `Schritt ${index + 1} verweist auf eine unbekannte Zutat`,
						path: ['steps', index, 'links']
					});
				}
			}
		});
	});

export type IngredientInput = z.infer<typeof ingredientInputSchema>;
export type StepInput = z.infer<typeof stepInputSchema>;
export type RecipeInput = z.infer<typeof recipeInputSchema>;

/** Ingredients that are not linked to any step */
export const findUnusedIngredients = (
	recipe: Pick<RecipeInput, 'ingredients' | 'steps'>
): IngredientInput[] => {
	const used = new Set(recipe.steps.flatMap((step) => step.links.map((link) => link.ingredientId)));
	return recipe.ingredients.filter((i) => i.kind === 'ingredient' && !used.has(i.clientId));
};
