CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipes_title_trgm_idx" ON "recipes" USING gin (lower("title") gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredients_name_trgm_idx" ON "ingredients" USING gin (lower("name") gin_trgm_ops);
