import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { safeRedirectTarget } from '#lib/redirectTarget.js';
import { getAuth } from '#lib/server/auth/config.js';
import { setRememberChoice } from '#lib/server/auth/remember.js';
import { verifyCaptcha } from '#lib/server/captcha.js';
import { getDb } from '#lib/server/context.js';
import { MailError } from '#lib/server/mail.js';
import { hitRateLimit } from '#lib/server/rateLimit.js';
import { hashIp } from '#lib/server/secret.js';

const HOUR = 60 * 60;
const emailSchema = z.email();

export async function load({ locals, url }) {
	const next = safeRedirectTarget(url.searchParams.get('weiter'));
	if (await locals.getSession()) redirect(303, next);
	return { next, linkFailed: url.searchParams.has('fehler') };
}

export const actions = {
	link: async (event) => {
		const { request, url, cookies, getClientAddress } = event;
		const form = await request.formData();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const remember = form.get('remember') === 'on';
		const next = safeRedirectTarget(String(form.get('next') ?? ''));

		if (!emailSchema.safeParse(email).success) {
			return fail(400, { email, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}
		const db = getDb();
		if (!(await verifyCaptcha(db, form.get('captcha')))) {
			return fail(400, {
				email,
				error: 'Die Prüfung gegen Bots ist fehlgeschlagen. Bitte versuche es noch einmal.'
			});
		}

		// the answer is the same when a limit is hit, so nobody learns more about an address
		const allowed =
			(await hitRateLimit(db, `magic-link:email:${email}`, 5, HOUR)) &&
			(await hitRateLimit(db, `magic-link:ip:${hashIp(getClientAddress())}`, 20, HOUR));
		if (!allowed) return { sent: email };

		setRememberChoice(cookies, url, remember);
		try {
			await getAuth(url.origin).api.signInMagicLink({
				body: {
					email,
					callbackURL: next,
					newUserCallbackURL: `/willkommen?weiter=${encodeURIComponent(next)}`,
					errorCallbackURL: '/anmelden?fehler=link'
				},
				headers: request.headers
			});
		} catch (error) {
			if (error instanceof MailError) {
				return fail(503, {
					email,
					error:
						'Die E-Mail konnte gerade nicht verschickt werden. Versuche es später noch einmal oder melde dich mit einem Passkey an.'
				});
			}
			throw error;
		}
		return { sent: email };
	},

	remember: async ({ request, url, cookies }) => {
		setRememberChoice(cookies, url, (await request.formData()).get('remember') === 'on');
		return { remembered: true };
	}
};
