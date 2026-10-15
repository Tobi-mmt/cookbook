import { sql } from 'drizzle-orm';
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	uniqueIndex,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';
import type { RecipeImage } from '../../../types';
import type { RecipeInput } from '../../recipeInput';

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};

export const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024;

/** Accounts of Better Auth, see `src/lib/server/auth/config.ts` for the additional fields */
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	username: text('username').unique(),
	role: text('role').notNull().default('user'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires', { withTimezone: true }),
	acceptedTermsAt: timestamp('accepted_terms_at', { withTimezone: true }),
	storageLimitBytes: integer('storage_limit_bytes').notNull().default(STORAGE_LIMIT_BYTES),
	/** set by admins, reports of this person get a lower priority */
	unreliableReporter: boolean('unreliable_reporter').notNull().default(false),
	deletionRequestedAt: timestamp('deletion_requested_at', { withTimezone: true }),
	...timestamps
});

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by'),
		/** `passkey` or `magic-link`, the admin area requires a passkey */
		authMethod: text('auth_method'),
		...timestamps
	},
	(table) => [index('sessions_user_id_idx').on(table.userId)]
);

export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
		scope: text('scope'),
		password: text('password'),
		...timestamps
	},
	(table) => [index('accounts_user_id_idx').on(table.userId)]
);

export const verifications = pgTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		...timestamps
	},
	(table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const passkeys = pgTable(
	'passkeys',
	{
		id: text('id').primaryKey(),
		name: text('name'),
		publicKey: text('public_key').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		credentialID: text('credential_id').notNull(),
		counter: integer('counter').notNull(),
		deviceType: text('device_type').notNull(),
		backedUp: boolean('backed_up').notNull(),
		transports: text('transports'),
		aaguid: text('aaguid'),
		createdAt: timestamp('created_at', { withTimezone: true })
	},
	(table) => [
		index('passkeys_user_id_idx').on(table.userId),
		index('passkeys_credential_id_idx').on(table.credentialID)
	]
);

/** Deleted accounts, deleted again after restoring a backup, see README */
export const deletionLog = pgTable('deletion_log', {
	userId: text('user_id').primaryKey(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }).notNull().defaultNow()
});

/** Former usernames redirect to the current one and are blocked for others until `releasedAt` */
export const usernameHistory = pgTable('username_history', {
	oldUsername: text('old_username').primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	releasedAt: timestamp('released_at', { withTimezone: true }).notNull()
});

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

export const cookbooks = pgTable(
	'cookbooks',
	{
		id: text('id').primaryKey(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => users.id),
		slug: text('slug').notNull(),
		name: text('name').notNull(),
		coverRecipeId: text('cover_recipe_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		hiddenAt: timestamp('hidden_at', { withTimezone: true }),
		hiddenReason: text('hidden_reason'),
		deletedAt: timestamp('deleted_at', { withTimezone: true })
	},
	(table) => [uniqueIndex('cookbooks_owner_slug_idx').on(table.ownerId, table.slug)]
);

/** Former slugs after a rename or a new owner, they redirect to the cookbook */
export const cookbookSlugHistory = pgTable(
	'cookbook_slug_history',
	{
		ownerId: text('owner_id').notNull(),
		oldSlug: text('old_slug').notNull(),
		cookbookId: text('cookbook_id')
			.notNull()
			.references(() => cookbooks.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.ownerId, table.oldSlug] })]
);

export const cookbookRoleEnum = pgEnum('cookbook_role', ['owner', 'editor']);

export const cookbookEditors = pgTable(
	'cookbook_editors',
	{
		cookbookId: text('cookbook_id')
			.notNull()
			.references(() => cookbooks.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: cookbookRoleEnum('role').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		primaryKey({ columns: [table.cookbookId, table.userId] }),
		index('cookbook_editors_user_id_idx').on(table.userId)
	]
);

export const invitations = pgTable('invitations', {
	id: text('id').primaryKey(),
	cookbookId: text('cookbook_id')
		.notNull()
		.references(() => cookbooks.id, { onDelete: 'cascade' }),
	tokenHash: text('token_hash').notNull().unique(),
	email: text('email'),
	createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	revokedAt: timestamp('revoked_at', { withTimezone: true })
});

/** One entry per step of a copy chain, the names are resolved when rendering */
export type Attribution = { recipeId: string; title: string; userId: string | null }[];

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
	cookbookId: text('cookbook_id')
		.notNull()
		.references(() => cookbooks.id, { onDelete: 'cascade' }),
	createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
	updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
	version: integer('version').notNull().default(1),
	copiedFromId: text('copied_from_id'),
	attribution: jsonb('attribution')
		.$type<Attribution>()
		.notNull()
		.default(sql`'[]'::jsonb`),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	deletedBy: text('deleted_by').references(() => users.id, { onDelete: 'set null' }),
	hiddenAt: timestamp('hidden_at', { withTimezone: true }),
	hiddenReason: text('hidden_reason')
});

/** The full state of a recipe after each save, the newest 20 per recipe are kept */
export type RecipeSnapshot = { input: RecipeInput; image: RecipeImage | null };

export const recipeVersions = pgTable(
	'recipe_versions',
	{
		id: serial('id').primaryKey(),
		recipeId: text('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		version: integer('version').notNull(),
		snapshot: jsonb('snapshot').$type<RecipeSnapshot>().notNull(),
		createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('recipe_versions_recipe_version_idx').on(table.recipeId, table.version)]
);

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

/** Unique visitors (summed up per day) and views per recipe, aggregated nightly from `page_views` */
export const recipeDailyViews = pgTable(
	'recipe_daily_views',
	{
		recipeId: text('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		day: date('day').notNull(),
		visitors: integer('visitors').notNull(),
		views: integer('views').notNull()
	},
	(table) => [
		primaryKey({ columns: [table.recipeId, table.day] }),
		index('recipe_daily_views_day_idx').on(table.day)
	]
);

export const REPORT_REASONS = [
	'inappropriate',
	'copyright',
	'spam',
	'dangerous',
	'personal_data',
	'harassment',
	'other'
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export const reportTargetEnum = pgEnum('report_target', ['image', 'recipe', 'cookbook', 'user']);
export const caseStatusEnum = pgEnum('case_status', ['open', 'in_review', 'done', 'rejected']);

/** All reports about the same object form one case */
export const reportCases = pgTable(
	'report_cases',
	{
		id: serial('id').primaryKey(),
		targetType: reportTargetEnum('target_type').notNull(),
		targetId: text('target_id').notNull(),
		status: caseStatusEnum('status').notNull().default('open'),
		priority: integer('priority').notNull().default(0),
		/** the reported object at the time of the first report */
		snapshot: jsonb('snapshot'),
		/** set for the case of an appeal against the decision of another case */
		appealOf: integer('appeal_of'),
		assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
		decision: text('decision'),
		decisionReason: text('decision_reason'),
		decidedBy: text('decided_by').references(() => users.id, { onDelete: 'set null' }),
		decidedAt: timestamp('decided_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('report_cases_target_idx').on(table.targetType, table.targetId)]
);

export const reports = pgTable('reports', {
	id: serial('id').primaryKey(),
	caseId: integer('case_id')
		.notNull()
		.references(() => reportCases.id, { onDelete: 'cascade' }),
	targetType: reportTargetEnum('target_type').notNull(),
	targetId: text('target_id').notNull(),
	reason: text('reason', { enum: REPORT_REASONS }).notNull(),
	comment: text('comment'),
	originalUrl: text('original_url'),
	isRightsHolder: boolean('is_rights_holder'),
	reporterUserId: text('reporter_user_id').references(() => users.id, { onDelete: 'set null' }),
	reporterEmail: text('reporter_email'),
	reporterIpHash: text('reporter_ip_hash'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const appeals = pgTable('appeals', {
	id: serial('id').primaryKey(),
	caseId: integer('case_id')
		.notNull()
		.references(() => reportCases.id, { onDelete: 'cascade' }),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	reason: text('reason').notNull(),
	status: text('status', { enum: ['open', 'upheld', 'reverted'] })
		.notNull()
		.default('open'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/** Every action in the admin area with the state before and after */
export const adminAuditLog = pgTable(
	'admin_audit_log',
	{
		id: serial('id').primaryKey(),
		adminId: text('admin_id').references(() => users.id, { onDelete: 'set null' }),
		action: text('action').notNull(),
		targetType: text('target_type').notNull(),
		targetId: text('target_id').notNull(),
		before: jsonb('before'),
		after: jsonb('after'),
		/** e.g. that the only admin decided about own content */
		note: text('note'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('admin_audit_log_created_at_idx').on(table.createdAt)]
);

export type CookbookRow = typeof cookbooks.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type RecipeRow = typeof recipes.$inferSelect;
export type IngredientRow = typeof ingredients.$inferSelect;
export type StepRow = typeof steps.$inferSelect;
export type StepIngredientRow = typeof stepIngredients.$inferSelect;
