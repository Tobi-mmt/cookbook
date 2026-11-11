CREATE TABLE "cookbook_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"cookbook_id" text NOT NULL,
	"quality" text NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"bytes" integer NOT NULL,
	"pages" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cookbook_exports_key_idx" ON "cookbook_exports" USING btree ("cookbook_id","quality","key");