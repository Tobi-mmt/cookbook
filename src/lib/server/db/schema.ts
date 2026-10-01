import {
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';
import type { RecipeImage } from '../../../types';

export const categoryEnum = pgEnum('category', ['Salat', 'Herzhaft', 'Süßspeise', 'Getränke']);
export const nutritionTypeEnum = pgEnum('nutrition_type', ['Vegan', 'Vegetarisch', 'Fleisch']);
export const ingredientKindEnum = pgEnum('ingredient_kind', ['ingredient', 'section']);
export const stepKindEnum = pgEnum('step_kind', ['step', 'section']);

export const recipes = pgTable('recipes', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	portion: integer('portion').notNull(),
	duration: integer('duration').notNull(),
	category: categoryEnum('category').notNull(),
	nutritionType: nutritionTypeEnum('nutrition_type').notNull(),
	image: jsonb('image').$type<RecipeImage>(),
	sourceUrl: text('source_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' }),
	position: integer('position').notNull(),
	kind: ingredientKindEnum('kind').notNull(),
	name: text('name').notNull(),
	quantity: numeric('quantity', { mode: 'number' }),
	unit: text('unit')
});

export const steps = pgTable('steps', {
	id: serial('id').primaryKey(),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' }),
	position: integer('position').notNull(),
	kind: stepKindEnum('kind').notNull(),
	text: text('text').notNull()
});

export const stepIngredients = pgTable(
	'step_ingredients',
	{
		stepId: integer('step_id')
			.notNull()
			.references(() => steps.id, { onDelete: 'cascade' }),
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => ingredients.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		/** overrides the ingredient quantity when a step uses only a part of it */
		quantity: numeric('quantity', { mode: 'number' })
	},
	(table) => [primaryKey({ columns: [table.stepId, table.ingredientId] })]
);

export type RecipeRow = typeof recipes.$inferSelect;
export type IngredientRow = typeof ingredients.$inferSelect;
export type StepRow = typeof steps.$inferSelect;
export type StepIngredientRow = typeof stepIngredients.$inferSelect;
