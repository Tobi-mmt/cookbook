import { importRecipeAction } from '$lib/server/adminActions';

/** Fetching the page and processing the image can take longer than the default limit */
export const config = { maxDuration: 60 };

export const actions = {
	default: (event) => importRecipeAction(event)
};
