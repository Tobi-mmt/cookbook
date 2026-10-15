ALTER TYPE "public"."nutrition_type" ADD VALUE 'Fisch';--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "categories" ("slug", "name", "color", "position") VALUES
	('fruehstueck', 'Frühstück', '#F2A65A', 1),
	('vorspeise-snack', 'Vorspeise & Snack', '#4FB3A9', 2),
	('suppe', 'Suppe', '#C9785B', 3),
	('salat', 'Salat', '#57B16B', 4),
	('hauptgericht', 'Hauptgericht', '#DD5D58', 5),
	('beilage-sosse', 'Beilage & Soße', '#5B8DC9', 6),
	('backen-dessert', 'Backen & Dessert', '#8882A8', 7),
	('getraenke', 'Getränke', '#F0CD5B', 8);--> statement-breakpoint
UPDATE "recipes" SET "category_id" = (
	SELECT "id" FROM "categories" WHERE "slug" = CASE "recipes"."category"
		WHEN 'Salat' THEN 'salat'
		WHEN 'Herzhaft' THEN 'hauptgericht'
		WHEN 'Süßspeise' THEN 'backen-dessert'
		WHEN 'Getränke' THEN 'getraenke'
	END
);
