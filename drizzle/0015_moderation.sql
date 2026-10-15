CREATE TYPE "public"."case_status" AS ENUM('open', 'in_review', 'done', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('image', 'recipe', 'cookbook', 'user');--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appeals" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"user_id" text,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_type" "report_target" NOT NULL,
	"target_id" text NOT NULL,
	"status" "case_status" DEFAULT 'open' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"snapshot" jsonb,
	"appeal_of" integer,
	"assigned_to" text,
	"decision" text,
	"decision_reason" text,
	"decided_by" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"target_type" "report_target" NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"comment" text,
	"original_url" text,
	"is_rights_holder" boolean,
	"reporter_user_id" text,
	"reporter_email" text,
	"reporter_ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_case_id_report_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."report_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cases" ADD CONSTRAINT "report_cases_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cases" ADD CONSTRAINT "report_cases_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_case_id_report_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."report_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_log_created_at_idx" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "report_cases_target_idx" ON "report_cases" USING btree ("target_type","target_id");