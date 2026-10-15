CREATE TABLE "mail_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"payload" jsonb,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mail_suppressions" (
	"email" text PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mail_log_created_at_idx" ON "mail_log" USING btree ("created_at");