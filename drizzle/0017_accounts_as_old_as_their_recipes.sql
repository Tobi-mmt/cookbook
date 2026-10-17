UPDATE "users" SET "created_at" = "first"."created_at"
FROM (SELECT "created_by", min("created_at") AS "created_at" FROM "recipes" WHERE "created_by" IS NOT NULL GROUP BY "created_by") AS "first"
WHERE "first"."created_by" = "users"."id" AND "first"."created_at" < "users"."created_at";
