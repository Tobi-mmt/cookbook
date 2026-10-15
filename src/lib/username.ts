export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

/** Pages of the app and names that would mislead, also for slugs of cookbooks */
export const RESERVED_NAMES = new Set([
	'admin',
	'administrator',
	'anmelden',
	'abmelden',
	'api',
	'einladung',
	'einstellungen',
	'hilfe',
	'impressum',
	'import',
	'datenschutz',
	'konto',
	'kochbuch',
	'moderation',
	'neu',
	'nutzungsbedingungen',
	'recipe',
	'rezept',
	'root',
	'sitemap',
	'support',
	'system',
	'verlauf',
	'willkommen',
	'widerspruch'
]);

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

/** Lowercase, umlauts written out, everything else that is not allowed becomes a hyphen */
export const toSlug = (text: string, maxLength = USERNAME_MAX) =>
	text
		.toLowerCase()
		.replace(/[äöüß]/g, (char) => UMLAUTS[char])
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, maxLength)
		.replace(/-+$/, '');

export const suggestUsername = (name: string, email?: string) => {
	const fromName = toSlug(name);
	const candidate = fromName.length >= USERNAME_MIN ? fromName : toSlug(email?.split('@')[0] ?? '');
	return candidate.length >= USERNAME_MIN ? candidate : '';
};

/** Returns an error message or null */
export const validateUsername = (username: string) => {
	if (username.length < USERNAME_MIN) return `Mindestens ${USERNAME_MIN} Zeichen`;
	if (username.length > USERNAME_MAX) return `Höchstens ${USERNAME_MAX} Zeichen`;
	if (!/^[a-z0-9-]+$/.test(username)) return 'Nur Kleinbuchstaben, Ziffern und Bindestriche';
	if (/^-|-$|--/.test(username)) return 'Bindestriche nur einzeln und nicht am Anfang oder Ende';
	if (RESERVED_NAMES.has(username)) return 'Dieser Name ist reserviert';
	return null;
};
