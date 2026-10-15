/** A readable default name for a new passkey, the person can change it */
export const deviceName = () => {
	const agent = navigator.userAgent;
	if (/iPhone/.test(agent)) return 'iPhone';
	if (/iPad/.test(agent)) return 'iPad';
	if (/Android/.test(agent)) return 'Android';
	if (/Macintosh/.test(agent)) return 'Mac';
	if (/Windows/.test(agent)) return 'Windows';
	if (/Linux/.test(agent)) return 'Linux';
	return 'Passkey';
};

/**
 * The name is only stored after registering: passed to `addPasskey`, Better Auth would also
 * make it the user name that password managers show instead of the e-mail address.
 */
export const createPasskey = async (name: string) => {
	const { authClient } = await import('#lib/authClient.js');
	const { data, error } = await authClient.passkey.addPasskey();
	if (error || !data) return false;
	await authClient.passkey.updatePasskey({ id: data.id, name: name.trim() || deviceName() });
	return true;
};

export const renamePasskey = async (id: string, name: string) => {
	const { authClient } = await import('#lib/authClient.js');
	const { error } = await authClient.passkey.updatePasskey({ id, name: name.trim() });
	return !error;
};
