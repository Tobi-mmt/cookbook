import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { safeRedirectTarget } from '#lib/redirectTarget.js';
import { getDb } from '#lib/server/context.js';
import { ensureCookbook, listEditableCookbooks } from '#lib/server/cookbooks.js';
import { affectedPaths } from '#lib/server/affectedPaths.js';
import { revalidate } from '#lib/server/revalidate.js';
import { users } from '#lib/server/db/schema.js';
import { changeUsername, isUsernameAvailable } from '#lib/server/users.js';
import { suggestUsername, validateUsername } from '#lib/username.js';

export async function load({ locals, url }) {
	const session = await locals.getSession();
	const next = safeRedirectTarget(url.searchParams.get('weiter'));
	if (!session) redirect(303, `/anmelden?weiter=${encodeURIComponent(url.pathname + url.search)}`);

	const { user } = session;
	return {
		next,
		done: Boolean(user.username && user.acceptedTermsAt),
		name: user.name,
		username: user.username ?? suggestUsername(user.name, user.email)
	};
}

export const actions = {
	default: async ({ request, locals, url }) => {
		const session = await locals.getSession();
		if (!session) return fail(401, { error: 'Bitte melde dich erneut an.' });

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const username = String(form.get('username') ?? '')
			.trim()
			.toLowerCase();
		const values = { name, username };

		if (!name) return fail(400, { ...values, error: 'Bitte gib deinen Namen an.' });
		const usernameError = validateUsername(username);
		if (usernameError) return fail(400, { ...values, error: usernameError });
		if (form.get('age') !== 'on') {
			return fail(400, { ...values, error: 'Ein Konto gibt es ab 16 Jahren.' });
		}
		if (form.get('terms') !== 'on') {
			return fail(400, {
				...values,
				error: 'Bitte stimme den Nutzungsbedingungen und der Datenschutzerklärung zu.'
			});
		}

		const db = getDb();
		if (!(await isUsernameAvailable(db, username, session.user.id))) {
			return fail(400, { ...values, error: 'Dieser Benutzername ist leider schon vergeben.' });
		}
		await changeUsername(db, session.user.id, username);
		await db
			.update(users)
			.set({ name, acceptedTermsAt: session.user.acceptedTermsAt ?? new Date() })
			.where(eq(users.id, session.user.id));
		await ensureCookbook(db, session.user.id);
		// somebody may have opened the address before it existed, the 404 would stay cached
		const cookbookIds = (await listEditableCookbooks(db, session.user.id)).map(({ id }) => id);
		await revalidate(url.origin, [`/@${username}`, ...(await affectedPaths(db, { cookbookIds }))]);
		return { saved: true };
	}
};
