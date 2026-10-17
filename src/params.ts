import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	/** `@username`, upper case letters are allowed here and redirect to the lower case address */
	handle: (param) => (/^@[a-zA-Z0-9-]{1,30}$/.test(param) ? param : undefined),
	/** `<id>.md`, the Markdown version of a recipe, gives the id */
	recipeMarkdown: (param) => (/^[\w-]+\.md$/.test(param) ? param.slice(0, -3) : undefined)
});
