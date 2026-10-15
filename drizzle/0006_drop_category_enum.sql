ALTER TABLE "recipes" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."category";