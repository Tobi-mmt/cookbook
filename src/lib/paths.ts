import { resolve } from '$app/paths';
import { slugerize } from './slugerize';

export const recipePath = (recipe: { id: string; title: string }) =>
	resolve('/rezept/[id]/[[titel]]', { id: recipe.id, titel: slugerize(recipe.title) });

export const profilePath = (username: string) =>
	resolve('/[handle=handle]', { handle: `@${username}` });

export const cookbookPath = (cookbook: { ownerUsername: string; slug: string }) =>
	resolve('/[handle=handle]/[cookbook]', {
		handle: `@${cookbook.ownerUsername}`,
		cookbook: cookbook.slug
	});
