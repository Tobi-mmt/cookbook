A platform for cookbooks: everybody can create recipes or import them from a link, edit cookbooks together with others and copy the recipes of others into their own cookbook. All content is public and licensed under CC BY-SA 4.0. The spec is in [`docs/spec-mehrbenutzer.md`](docs/spec-mehrbenutzer.md), what is still to do before the start in [`docs/todo.md`](docs/todo.md).

Recipes are stored in Postgres (Neon) and the images in Vercel Blob. People sign in with a link by mail or with a passkey (Better Auth), mails are sent through Scaleway Transactional Email.

## Getting Started

```bash
cp .env.example .env
podman compose up -d        # starts Postgres
yarn db:migrate             # creates the tables
yarn dev
```

Open [http://localhost:5173/anmelden](http://localhost:5173/anmelden) and sign in. Without `SCW_SECRET_KEY` no mail is sent, the sign-in link is printed in the console instead. To use the admin area locally, make your account an admin:

```sql
update users set role = 'admin' where username = '<your username>';
```

In production the admin area needs a sign-in with a passkey, locally a link by mail is enough.

Locally there is no Vercel Blob: when `BLOB_READ_WRITE_TOKEN` is empty, images are stored in `.data/blob` and served from `/dev-blob/…`.

To copy the people, cookbooks and recipes of production into the local database:

```bash
vercel env pull --environment=production .env.production.local
SOURCE_POSTGRES_URL=<POSTGRES_URL from that file> yarn seed:from-prod
```

## Tests

`yarn test` runs the unit tests. Tests named `*.db.test.ts` need a Postgres server and only run with `TEST_POSTGRES_URL`, e.g. `TEST_POSTGRES_URL=postgres://cookbook:cookbook@localhost:5432/cookbook yarn test`. Each test file creates and drops its own database. The GitHub workflow starts a Postgres for them.

## Database changes

Change `src/lib/server/db/schema.ts`, then run `yarn db:generate` to create a migration in `drizzle/`. Production and preview deployments run the migrations during the Vercel build. Previews must therefore always use their own database branch, never the production database.

## Addresses

| Path                       | Page                                                 |
| -------------------------- | ---------------------------------------------------- |
| `/`                        | Search over all recipes, popular and new recipes     |
| `/@username`               | All recipes of a person, filterable by cookbook      |
| `/@username/cookbook`      | A cookbook, `…/einstellungen` for its editors        |
| `/rezept/{id}/{title}`     | A recipe, `…/bearbeiten` and `…/verlauf` for editors |
| `/neu`, `/import`          | Create or import a recipe                            |
| `/anmelden`, `/willkommen` | Sign in or register, choose a username               |
| `/konto`                   | Account, passkeys, export, deletion                  |
| `/einladung/{token}`       | Join a cookbook                                      |
| `/widerspruch/{case}`      | Appeal against a decision of the moderation          |
| `/admin`                   | Moderation and administration, admins with passkey   |

Former usernames and cookbook slugs redirect, as do `/username` without `@` and the old `/recipe/…` links.

## How changes go live

The public pages use Vercel ISR: they are rendered once and then served from the cache. They must never depend on the session (`src/routes/isr.test.ts` checks that), the browser loads everything personal from `/api/me`. After a change, the affected pages are revalidated: the recipe, its cookbook, the profiles of all editors and the home page (`src/lib/server/affectedPaths.ts`). The pages never expire on their own. If revalidation fails, they are updated by the next weekly cache warm-up.

Every deployment starts with an empty cache. Therefore `/api/warm-cache` renders the home page, the profiles and the newest recipes after every production deployment (`.github/workflows/warm-cache.yml`) and once a week as Vercel cron (`vercel.json`). All other pages render on their first visit.

## Nightly job

`/api/cron/daily` runs every night as Vercel cron (`src/lib/server/dailyJob.ts`). It sums up the page views per recipe and day (used for "Beliebt" on the home page and the statistics of a cookbook), deletes raw page views after 30 months, empties the trash after 30 days, deletes accounts 7 days after their deletion was requested, resends failed mails, closes cases about deleted content and mails the admins a summary of new reports and warnings about many mails or a full database.

## Tracking

Visitors are counted without cookies, like [Plausible](https://plausible.io/data-policy) does it (`src/lib/server/tracking.ts`). The layout sends a beacon to `/api/event` on every navigation, because the cached ISR pages never reach the server. The server stores a hash of a random daily salt, the host, the IP and the user agent, but never the IP itself. The salt is deleted the next day, then the hashes can no longer be linked to anybody, so visitors are only unique within a day. Besides the page, only the browser and OS family without versions are stored. Bots are not counted. The numbers are shown at `/admin/stats`.

## Backups

Every night `.github/workflows/backup.yml` dumps the database with a read-only role, refuses a dump smaller than half of the last one, restores it into a temporary Postgres as a test, encrypts it with [age](https://age-encryption.org) and uploads it to Scaleway Object Storage with a key that may only write. On the first of a month the dump is also stored as a monthly backup. On Sundays the images of Vercel Blob follow. Lifecycle rules of the bucket delete daily backups after 30 days, monthly ones after 6 months and images after 4 weeks.

To restore a backup:

1. Download it from the bucket (`database/daily/…` or `database/monthly/…`) and decrypt it with the private key from the password manager: `age --decrypt --identity key.txt --output database.dump database.dump.age`.
2. Create a new branch in the Neon console and restore into it, never directly into production: `pg_restore --no-owner --no-privileges --clean --dbname=<url of the branch> database.dump`.
3. Delete the accounts that were deleted after the backup: `POSTGRES_URL=<url of the branch> yarn db:reapply-deletions`.
4. Check the branch with a preview deployment that points to it.
5. Make the branch the main branch or copy single rows back.

Images: download `images/…tar.gz.age`, decrypt it the same way and upload the files to Vercel Blob under their paths.

## Environment variables

They are declared in `src/env.ts` and read from `$app/env/private`. All of them are optional locally, the app explains what is missing where it is needed.

| Name                    | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `POSTGRES_URL`          | Postgres connection string (set by the Neon integration)       |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (set by the Blob integration), empty locally |
| `BETTER_AUTH_SECRET`    | Random string, signs sessions, captchas and mail links         |
| `SCW_SECRET_KEY`        | Scaleway API key for Transactional Email, empty locally        |
| `SCW_PROJECT_ID`        | Scaleway project of Transactional Email                        |
| `MAIL_FROM`             | Sender, e.g. `Kochbuchbande <hallo@mail.kochbuchbande.de>`     |
| `MAIL_REPLY_TO`         | Reply-To address, e.g. `support@kochbuchbande.de`              |
| `MAIL_WEBHOOK_SECRET`   | Secret in the URL of the Scaleway webhook for bounces          |
| `ISR_BYPASS_TOKEN`      | Random string with at least 32 characters for the revalidation |
| `CRON_SECRET`           | Random string for the crons, also a GitHub secret              |
| `BUGSINK_DSN`           | DSN of the Bugsink project, errors are only logged without it  |

The backup workflow uses the GitHub secrets `BACKUP_DATABASE_URL`, `SCW_BACKUP_ACCESS_KEY`, `SCW_BACKUP_SECRET_KEY` and `BLOB_READ_WRITE_TOKEN` and the variables `BACKUP_BUCKET`, `AGE_PUBLIC_KEY` and optionally `PG_MAJOR`.
