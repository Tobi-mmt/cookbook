import { importRecipeAction } from '$lib/server/adminActions';

export const actions = {
	default: (event) => importRecipeAction(event)
};
