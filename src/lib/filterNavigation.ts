import { goto } from '$app/navigation';
import { page } from '$app/state';

/** Changes a filter in the address without loading the page again (shallow routing) */
export const setFilterParam = (name: string, value: string | null | undefined) => {
	const next = new URL((page.shallow?.url ?? page.url).href);
	if (value) next.searchParams.set(name, value);
	else next.searchParams.delete(name);
	// eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow navigation on the current page
	return goto(next, { shallow: true, replace: true });
};

// eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow navigation on the current page
export const resetFilters = () => goto(page.url.pathname, { shallow: true, replace: true });
