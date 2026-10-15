CREATE TYPE "public"."cookbook_role" AS ENUM('owner', 'editor');--> statement-breakpoint
CREATE TABLE "cookbook_editors" (
	"cookbook_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "cookbook_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cookbook_editors_cookbook_id_user_id_pk" PRIMARY KEY("cookbook_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "cookbook_slug_history" (
	"owner_id" text NOT NULL,
	"old_slug" text NOT NULL,
	"cookbook_id" text NOT NULL,
	CONSTRAINT "cookbook_slug_history_owner_id_old_slug_pk" PRIMARY KEY("owner_id","old_slug")
);
--> statement-breakpoint
CREATE TABLE "cookbooks" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"cover_recipe_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hidden_at" timestamp with time zone,
	"hidden_reason" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"cookbook_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"email" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "cookbook_id" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "copied_from_id" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "attribution" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "hidden_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "hidden_reason" text;--> statement-breakpoint
ALTER TABLE "cookbook_editors" ADD CONSTRAINT "cookbook_editors_cookbook_id_cookbooks_id_fk" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookbook_editors" ADD CONSTRAINT "cookbook_editors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookbook_slug_history" ADD CONSTRAINT "cookbook_slug_history_cookbook_id_cookbooks_id_fk" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookbooks" ADD CONSTRAINT "cookbooks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_cookbook_id_cookbooks_id_fk" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cookbook_editors_user_id_idx" ON "cookbook_editors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cookbooks_owner_slug_idx" ON "cookbooks" USING btree ("owner_id","slug");--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_cookbook_id_cookbooks_id_fk" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- The existing recipes belong to Mona and Tobias. The mail addresses are placeholders that are
-- replaced in the Neon console, see docs/todo.md. Fresh databases without recipes stay empty.
INSERT INTO "users" ("id", "name", "email", "email_verified", "username", "role", "accepted_terms_at")
SELECT v.id, v.name, v.email, true, v.username, v.role, now()
FROM (VALUES
	('user-tobi', 'Tobias', 'tobi@kochbuch.invalid', 'tobi', 'admin'),
	('user-mona', 'Mona', 'mona@kochbuch.invalid', 'mona', 'user')
) AS v(id, name, email, username, role)
WHERE EXISTS (SELECT 1 FROM "recipes");--> statement-breakpoint
INSERT INTO "cookbooks" ("id", "owner_id", "slug", "name")
SELECT 'cookbook-unser', 'user-tobi', 'unser-kochbuch', 'Unser Kochbuch'
WHERE EXISTS (SELECT 1 FROM "recipes");--> statement-breakpoint
INSERT INTO "cookbook_editors" ("cookbook_id", "user_id", "role")
SELECT 'cookbook-unser', v.user_id, v.role::"cookbook_role"
FROM (VALUES ('user-tobi', 'owner'), ('user-mona', 'editor')) AS v(user_id, role)
WHERE EXISTS (SELECT 1 FROM "recipes");--> statement-breakpoint
UPDATE "recipes" SET "cookbook_id" = 'cookbook-unser', "created_by" = 'user-tobi', "updated_by" = 'user-tobi';--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "cookbook_id" SET NOT NULL;