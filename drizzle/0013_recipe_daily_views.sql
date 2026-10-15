CREATE TABLE "recipe_daily_views" (
	"recipe_id" text NOT NULL,
	"day" date NOT NULL,
	"visitors" integer NOT NULL,
	"views" integer NOT NULL,
	CONSTRAINT "recipe_daily_views_recipe_id_day_pk" PRIMARY KEY("recipe_id","day")
);
--> statement-breakpoint
ALTER TABLE "recipe_daily_views" ADD CONSTRAINT "recipe_daily_views_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recipe_daily_views_day_idx" ON "recipe_daily_views" USING btree ("day");--> statement-breakpoint
-- the views counted so far, both under the former /recipe/ and the new /rezept/ paths
INSERT INTO "recipe_daily_views" ("recipe_id", "day", "visitors", "views")
SELECT split_part(pv."path", '/', 3), pv."day", count(DISTINCT pv."visitor_hash"), count(*)
FROM "page_views" pv
WHERE (pv."path" LIKE '/recipe/%' OR pv."path" LIKE '/rezept/%')
	AND split_part(pv."path", '/', 3) IN (SELECT "id" FROM "recipes")
GROUP BY 1, 2
ON CONFLICT DO NOTHING;
