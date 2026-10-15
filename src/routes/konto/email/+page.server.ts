import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { readEmailChangeToken } from '#lib/server/accounts.js';
import { getDb } from '#lib/server/context.js';
import { users } from '#lib/server/db/schema.js';
import { renderMail, sendMail } from '#lib/server/mail.js';

/** Confirms a new mail address and tells the old one about it */
export async function load({ url }) {
	const data = readEmailChangeToken(url.searchParams.get('token') ?? '');
	if (!data) error(400, 'Der Link ist ungültig oder abgelaufen.');

	const db = getDb();
	const user = await db.query.users.findFirst({ where: eq(users.id, data.userId) });
	if (!user) error(400, 'Der Link ist ungültig oder abgelaufen.');
	if (user.email !== data.email) {
		await db
			.update(users)
			.set({ email: data.email, emailVerified: true })
			.where(eq(users.id, user.id));
		await sendMail(
			db,
			user.email,
			renderMail({
				subject: 'Deine E-Mail-Adresse wurde geändert',
				paragraphs: [
					`Hallo ${user.name},`,
					`dein Konto verwendet ab jetzt die Adresse ${data.email}. Warst du das nicht? Dann antworte bitte auf diese Mail.`
				]
			}),
			{ kind: 'email-changed' }
		).catch(console.error);
	}
	redirect(303, '/konto?email=bestaetigt');
}
