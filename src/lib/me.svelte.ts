import type { EditableCookbook } from '#lib/server/cookbooks.js';

export type Me = {
	user: { username: string; name: string; role: string; deletionAt: string | null } | null;
	cookbooks: EditableCookbook[];
	needsOnboarding: boolean;
};

let current = $state<Me | null>(null);
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
