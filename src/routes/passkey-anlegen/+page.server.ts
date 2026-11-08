import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { safeRedirectTarget } from '#lib/redirectTarget.js';
import { readRememberChoice } from '#lib/server/auth/remember.js';
import { getDb } from '#lib/server/context.js';
import { passkeys } from '#lib/server/db/schema.js';

/**
 * Every sign-in by mail leads through here: as long as somebody signs in by mail, we ask for a
 * passkey for this device, that saves the mail next time. The page itself checks whether the
 * device can hold one and whether it should not ask on this device any more.
 */
export async function load({ locals, url, cookies }) {
	const next = safeRedirectTarget(url.searchParams.get('weiter'));
	const session = await locals.getSession();
	if (!session) redirect(303, `/anmelden?weiter=${encodeURIComponent(next)}`);
	if (session.authMethod !== 'magic-link') redirect(303, next);

	const existing = await getDb().query.passkeys.findFirst({
		where: eq(passkeys.userId, session.user.id),
		columns: { id: true }
	});
	return { next, hasPasskeys: Boolean(existing), remember: readRememberChoice(cookies, url) };
}
