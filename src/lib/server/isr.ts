import { env } from '$env/dynamic/private';

/**
 * Pages are rendered once and then served from the Vercel cache like static files.
 * The admin revalidates the affected paths after every change (see `revalidate.ts`),
 * the expiration is only a safety net.
 */
export const isrConfig = {
	isr: {
		expiration: 60 * 60 * 24,
		bypassToken: env.ISR_BYPASS_TOKEN
	}
};
