import type { RequestEvent } from '@sveltejs/kit';
import { getAuth } from './config';

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	username: string | null;
	role: string;
	acceptedTermsAt: Date | null;
	createdAt: Date;
};

export type Session = { user: SessionUser; authMethod: string | null };

/**
 * Reads the session once per request. Pages that are cached with ISR must never call this,
 * whatever they render would be shown to everybody.
 */
export const loadSession = async (event: RequestEvent): Promise<Session | null> => {
	const result = await getAuth(event.url.origin).api.getSession({
		headers: event.request.headers
	});
	if (!result) return null;
	const { user, session } = result;
	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			username: user.username ?? null,
			role: user.role ?? 'user',
			acceptedTermsAt: user.acceptedTermsAt ?? null,
			createdAt: user.createdAt
		},
		authMethod: session.authMethod ?? null
	};
};
