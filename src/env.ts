import { defineEnvVars } from '@sveltejs/kit/env';

/** Unset or empty variables become undefined, the code that uses them handles that case */
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	POSTGRES_URL: {
		description: 'Postgres connection string, set by the Neon integration',
		// optional, so that builds work without a database, `getDb` throws when it is missing
		schema: optional
	},
	BLOB_READ_WRITE_TOKEN: {
		description: 'Vercel Blob token, empty locally to store images in .data/blob',
		schema: optional
	},
	BETTER_AUTH_SECRET: {
		description:
			'Random string with at least 32 characters, signs sessions, captchas and IP hashes',
		schema: optional
	},
	ISR_BYPASS_TOKEN: {
		description: 'Random string with at least 32 characters for the ISR revalidation',
		// the ISR config of the routes is read during the build
		static: true,
		schema: optional
	},
	SCW_SECRET_KEY: {
		description: 'Scaleway API key for Transactional Email, mails are only logged without it',
		schema: optional
	},
	SCW_PROJECT_ID: {
		description: 'Scaleway project of Transactional Email',
		schema: optional
	},
	MAIL_FROM: {
		description: 'Sender, e.g. `Kochbuchbande <hallo@mail.kochbuchbande.de>`',
		schema: optional
	},
	MAIL_REPLY_TO: {
		description: 'Reply-To address, e.g. `support@kochbuchbande.de`',
		schema: optional
	},
	MAIL_WEBHOOK_SECRET: {
		description: 'Random string in the URL of the Scaleway webhook for bounces and complaints',
		schema: optional
	},
	BUGSINK_DSN: {
		description: 'DSN of the Bugsink project for error tracking, errors are only logged without it',
		schema: optional
	},
	VERCEL_ENV: {
		description: 'Set by Vercel: production, preview or development',
		schema: optional
	},
	VERCEL_GIT_COMMIT_SHA: {
		description: 'Set by Vercel: the deployed commit, the release in Bugsink',
		schema: optional
	},
	CRON_SECRET: {
		description: 'Random string that protects /api/warm-cache',
		schema: optional
	}
});
