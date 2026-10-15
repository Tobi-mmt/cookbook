import {
	date,
	index,
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

export const nutritionTypeEnum = pgEnum('nutrition_type', [
	'Vegan',
	'Vegetarisch',
	'Fleisch',
	'Fisch'
]);
export const ingredientKindEnum = pgEnum('ingredient_kind', ['ingredient', 'section']);
export const stepKindEnum = pgEnum('step_kind', ['step', 'section']);

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull().unique(),
	color: text('color').notNull(),
	position: integer('position').notNull()
});

export const recipes = pgTable('recipes', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	portion: integer('portion').notNull(),
	duration: integer('duration').notNull(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => categories.id),
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

/** One random salt per day, older salts are deleted so that visitor hashes can no longer be linked to an IP */
export const trackingSalts = pgTable('tracking_salts', {
	day: date('day').primaryKey(),
	salt: text('salt').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const pageViews = pgTable(
	'page_views',
	{
		id: serial('id').primaryKey(),
		day: date('day').notNull(),
		/** hash of the daily salt, host, IP and user agent, never the IP itself */
		visitorHash: text('visitor_hash').notNull(),
		path: text('path').notNull(),
		/** only the browser and OS family without versions, null if unknown */
		browser: text('browser'),
		os: text('os'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('page_views_day_path_idx').on(table.day, table.path)]
);

/** Fixed-window counters for rate limits and for captcha solutions that were already used */
export const rateLimits = pgTable('rate_limits', {
	key: text('key').primaryKey(),
	count: integer('count').notNull(),
	resetAt: timestamp('reset_at', { withTimezone: true }).notNull()
});

/** Every sent mail, failed moderation mails keep their payload until the daily job resends them */
export const mailLog = pgTable(
	'mail_log',
	{
		id: serial('id').primaryKey(),
		recipient: text('recipient').notNull(),
		kind: text('kind').notNull(),
		status: text('status', {
			enum: ['sent', 'logged', 'pending', 'failed', 'suppressed']
		}).notNull(),
		payload: jsonb('payload').$type<{ subject: string; text: string; html: string }>(),
		attempts: integer('attempts').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		sentAt: timestamp('sent_at', { withTimezone: true })
	},
	(table) => [index('mail_log_created_at_idx').on(table.createdAt)]
);

/** Addresses that bounced or complained, nothing is sent to them anymore */
export const mailSuppressions = pgTable('mail_suppressions', {
	email: text('email').primaryKey(),
	reason: text('reason').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type CategoryRow = typeof categories.$inferSelect;
export type RecipeRow = typeof recipes.$inferSelect;
export type IngredientRow = typeof ingredients.$inferSelect;
export type StepRow = typeof steps.$inferSelect;
export type StepIngredientRow = typeof stepIngredients.$inferSelect;
