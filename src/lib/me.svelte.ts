import type { EditableCookbook } from '#lib/server/cookbooks.js';

export type Me = {
	user: { username: string; name: string; role: string; deletionAt: string | null } | null;
	cookbooks: EditableCookbook[];
	needsOnboarding: boolean;
};

let current = $state<Me | null>(null);

/** read by the script in app.html before the first paint, so that guest-only parts do not flash */
const rememberSignedIn = (signedIn: boolean) => {
	document.documentElement.classList.toggle('signed-in', signedIn);
	try {
		if (signedIn) localStorage.setItem('signed-in', '1');
		else localStorage.removeItem('signed-in');
	} catch {
		// without storage the class only lasts for this page
	}
};
let loading: Promise<void> | undefined;

/**
 * The signed in person, loaded in the browser after the page, because the pages are cached
 * for everybody (see `src/routes/api/me/+server.ts`). `null` until it is known.
 */
export const me = {
	get current() {
		return current;
	},
	load() {
		return (loading ??= fetch('/api/me')
			.then((response) => response.json())
			.then((data: Me) => {
				current = data;
				rememberSignedIn(Boolean(data.user));
			})
			.catch((error) => {
				loading = undefined;
				console.error(error);
			}));
	},
	refresh() {
		loading = undefined;
		return this.load();
	},
	canEdit(cookbookId: string) {
		return Boolean(current?.cookbooks.some(({ id }) => id === cookbookId));
	}
};
