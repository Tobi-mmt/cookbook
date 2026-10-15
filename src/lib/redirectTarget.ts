/** Only paths of this site, so that a link cannot send anybody elsewhere after signing in */
export const safeRedirectTarget = (target: string | null | undefined, fallback = '/') =>
	target?.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
		? target
		: fallback;
