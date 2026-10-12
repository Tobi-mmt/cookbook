CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"visitor_hash" text NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_salts" (
	"day" date PRIMARY KEY NOT NULL,
	"salt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "page_views_day_path_idx" ON "page_views" USING btree ("day","path");