CREATE TYPE "public"."category" AS ENUM('Salat', 'Herzhaft', 'Süßspeise', 'Getränke');--> statement-breakpoint
CREATE TYPE "public"."ingredient_kind" AS ENUM('ingredient', 'section');--> statement-breakpoint
CREATE TYPE "public"."nutrition_type" AS ENUM('Vegan', 'Vegetarisch', 'Fleisch');--> statement-breakpoint
CREATE TYPE "public"."step_kind" AS ENUM('step', 'section');--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" "ingredient_kind" NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric,
	"unit" text
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"portion" integer NOT NULL,
	"duration" integer NOT NULL,
	"category" "category" NOT NULL,
	"nutrition_type" "nutrition_type" NOT NULL,
	"image" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_ingredients" (
	"step_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"position" integer NOT NULL,
	"quantity" numeric,
	CONSTRAINT "step_ingredients_step_id_ingredient_id_pk" PRIMARY KEY("step_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" "step_kind" NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_ingredients" ADD CONSTRAINT "step_ingredients_step_id_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_ingredients" ADD CONSTRAINT "step_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;