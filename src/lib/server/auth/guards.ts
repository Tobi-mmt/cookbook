import { redirect, type RequestEvent } from '@sveltejs/kit';

const signInUrl = (event: RequestEvent, path: string) =>
	`${path}?weiter=${encodeURIComponent(event.url.pathname + event.url.search)}`;

/** For pages that need an account, people who have not finished the registration go back there */
export const requireUser = async (event: RequestEvent) => {
	const session = await event.locals.getSession();
	if (!session) redirect(303, signInUrl(event, '/anmelden'));
	if (!session.user.username || !session.user.acceptedTermsAt) {
		redirect(303, signInUrl(event, '/willkommen'));
	}
	return { ...session.user, username: session.user.username };
};
