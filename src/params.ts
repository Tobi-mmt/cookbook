import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	/** `@username`, upper case letters are allowed here and redirect to the lower case address */
	handle: (param) => (/^@[a-zA-Z0-9-]{1,30}$/.test(param) ? param : undefined)
});
