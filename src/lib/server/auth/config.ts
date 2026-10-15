import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { magicLink } from 'better-auth/plugins/magic-link';
import { getDb } from '../context';
import * as schema from '../db/schema';
import { renderMail, sendMail } from '../mail';
import { appSecret } from '../secret';

const DAY = 60 * 60 * 24;

const createAuth = (origin: string) =>
	betterAuth({
		appName: 'Kochbuch',
		baseURL: origin,
		secret: appSecret(),
		database: drizzleAdapter(getDb(), { provider: 'pg', schema, usePlural: true }),
		user: {
			additionalFields: {
				username: { type: 'string', required: false, input: false },
				acceptedTermsAt: { type: 'date', required: false, input: false }
			}
		},
		session: {
			expiresIn: 30 * DAY,
			updateAge: DAY,
			additionalFields: {
				authMethod: { type: 'string', required: false, input: false }
			}
		},
		advanced: { cookiePrefix: 'kochbuch' },
		// our own limits in Postgres, see `requestSignInLink`
		rateLimit: { enabled: false },
		databaseHooks: {
			session: {
				create: {
					before: async (session, context) => ({
						data: {
							...session,
							authMethod: context?.path?.includes('passkey') ? 'passkey' : 'magic-link'
						}
					})
				}
			}
		},
		plugins: [
			magicLink({
				expiresIn: 15 * 60,
				storeToken: 'hashed',
				sendMagicLink: async ({ email, url }) => {
					await sendMail(
						getDb(),
						email,
						renderMail({
							subject: 'Dein Anmelde-Link',
							paragraphs: [
								'Hallo,',
								'mit diesem Link meldest du dich an. Er ist 15 Minuten gültig und funktioniert einmal.'
							],
							button: { label: 'Anmelden', url },
							footer:
								'Du hast keinen Link angefordert? Dann ignoriere diese Mail, ohne den Link passiert nichts.'
						}),
						{ kind: 'magic-link' }
					);
				}
			}),
			passkey({ rpID: new URL(origin).hostname, rpName: 'Kochbuch', origin }),
			admin({ defaultRole: 'user', adminRoles: ['admin'] })
		]
	});

export type Auth = ReturnType<typeof createAuth>;

const instances = new Map<string, Auth>();

/** Passkeys are bound to the host, so every origin (production, previews, localhost) gets its own instance */
export const getAuth = (origin: string) => {
	let auth = instances.get(origin);
	if (!auth) {
		auth = createAuth(origin);
		instances.set(origin, auth);
	}
	return auth;
};
