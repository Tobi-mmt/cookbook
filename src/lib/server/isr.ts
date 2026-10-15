import { ISR_BYPASS_TOKEN } from '$app/env/private';

/**
 * Pages are rendered once and then served from the Vercel cache like static files.
 * They never expire: the admin revalidates the affected paths after every change
 * (see `revalidate.ts`), and the weekly cache warm-up re-renders all of them as a safety net.
 */
export const isrConfig = {
	isr: { expiration: false as const, bypassToken: ISR_BYPASS_TOKEN }
};
