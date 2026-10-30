import { z } from 'zod';

export const NUTRITION_TYPES = ['Vegan', 'Vegetarisch', 'Fisch', 'Fleisch'] as const;

const trimmed = z.string().trim();

/** Upper bounds for everything that can be entered, generous for real recipes */
export const RECIPE_LIMITS = {
	title: 200,
	description: 2000,
	name: 200,
	unit: 50,
	step: 3000,
	ingredients: 150,
	steps: 100,
	portion: 1000,
	duration: 10000
};

export const ingredientInputSchema = z.object({
	/** stable id within the editor, referenced by the steps */
	clientId: z.string().min(1),
	kind: z.enum(['ingredient', 'section']),
	name: trimmed
		.min(1, 'Eine Zutat oder ein Abschnitt hat keinen Namen')
		.max(
			RECIPE_LIMITS.name,
			`Der Name einer Zutat darf höchstens ${RECIPE_LIMITS.name} Zeichen lang sein`
		),
	quantity: z.number().positive().nullable().optional(),
	unit: trimmed
		.max(RECIPE_LIMITS.unit, `Eine Einheit darf höchstens ${RECIPE_LIMITS.unit} Zeichen lang sein`)
		.nullable()
		.optional()
});

export const stepInputSchema = z.object({
	kind: z.enum(['step', 'section']),
	text: trimmed
		.min(1, 'Ein Schritt oder Abschnitt hat keinen Text')
		.max(RECIPE_LIMITS.step, `Ein Schritt darf höchstens ${RECIPE_LIMITS.step} Zeichen lang sein`),
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
		title: trimmed
			.min(1, 'Titel fehlt')
			.max(
				RECIPE_LIMITS.title,
				`Der Titel darf höchstens ${RECIPE_LIMITS.title} Zeichen lang sein`
			),
		description: trimmed
			.max(
				RECIPE_LIMITS.description,
				`Die Beschreibung darf höchstens ${RECIPE_LIMITS.description} Zeichen lang sein`
			)
			.nullable()
			.optional(),
		sourceUrl: z.preprocess(
			(value) => (typeof value === 'string' ? value.trim() || null : value),
			z
				.url({ protocol: /^https?$/, error: 'Ungültige Quell-URL' })
				.nullable()
				.optional()
		),
		portion: z
			.number({ error: 'Portionen fehlen' })
			.int('Portionen müssen eine ganze Zahl sein')
			.positive('Portionen müssen mindestens 1 sein')
			.max(RECIPE_LIMITS.portion, `Höchstens ${RECIPE_LIMITS.portion} Portionen`),
		duration: z
			.number({ error: 'Dauer fehlt' })
			.int('Dauer muss eine ganze Zahl sein')
			.positive('Dauer muss mindestens 1 Minute sein')
			.max(
				RECIPE_LIMITS.duration,
				`Die Dauer darf höchstens ${RECIPE_LIMITS.duration} Minuten sein`
			),
		categoryId: z.number({ error: 'Kategorie fehlt' }).int().positive(),
		nutritionType: z.enum(NUTRITION_TYPES, { error: 'Ernährung fehlt' }),
		ingredients: z
			.array(ingredientInputSchema)
			.max(RECIPE_LIMITS.ingredients, `Höchstens ${RECIPE_LIMITS.ingredients} Zutaten`),
		steps: z
			.array(stepInputSchema)
			.min(1, 'Mindestens ein Zubereitungsschritt fehlt')
			.max(RECIPE_LIMITS.steps, `Höchstens ${RECIPE_LIMITS.steps} Schritte`)
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
