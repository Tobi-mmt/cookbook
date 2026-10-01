This is my personal cookbook with some recipes collected over the years.

Recipes are stored in Postgres (Neon) and the images in Vercel Blob. They are maintained in the admin area at `/admin`.

## Getting Started

```bash
cp .env.example .env        # local password is "admin"
podman compose up -d        # starts Postgres
yarn db:migrate             # creates the tables
yarn migrate:legacy         # imports the former recipe files (only while src/lib/recipes exists)
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to see the cookbook and [http://localhost:5173/admin](http://localhost:5173/admin) to edit recipes.

Locally there is no Vercel Blob: when `BLOB_READ_WRITE_TOKEN` is empty, images are stored in `.data/blob` and served from `/dev-blob/…`.

To copy the production recipes into the local database:

```bash
vercel env pull --environment=production .env.production.local
SOURCE_DATABASE_URL=<DATABASE_URL from that file> yarn seed:from-prod
```

## Database changes

Change `src/lib/server/db/schema.ts`, then run `yarn db:generate` to create a migration in `drizzle/`. Production runs the migrations during the Vercel build. Preview deployments only run them with `MIGRATE_ON_PREVIEW=1`, because they must not change a database that production still uses.

## How changes go live

The public pages use Vercel ISR: they are rendered once and then served from the cache. After a recipe is saved or deleted, the admin revalidates the affected pages (`src/lib/server/revalidate.ts`), so changes are live within seconds without a new deployment. If revalidation fails, the pages expire after 24 hours at the latest.

## Environment variables

| Name                    | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`          | Postgres connection string (set by the Neon integration)        |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (set by the Blob integration), empty locally  |
| `ADMIN_PASSWORD_HASH`   | Created with `yarn hash-password <password>`                    |
| `SESSION_SECRET`        | Random string that signs the admin session cookie               |
| `ISR_BYPASS_TOKEN`      | Random string with at least 32 characters for the revalidation  |
| `MIGRATE_ON_PREVIEW`    | Set to `1` if preview deployments use their own database branch |
