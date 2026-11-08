const ON_DEVICE = 'passkey-on-device';
const PROMPT_OFF = 'passkey-prompt-off';

const readFlag = (key: string) => {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
};

const setFlag = (key: string) => {
	try {
		localStorage.setItem(key, '1');
	} catch {
		// without storage we only forget it, nothing breaks
	}
};

/**
 * Websites cannot ask whether a device holds a passkey for them, so we remember that we saw one
 * here. The sign-in page then puts the passkey first, app.html sets the class before the first paint.
 */
export const rememberPasskeyOnDevice = () => {
	setFlag(ON_DEVICE);
	document.documentElement.classList.add('passkey-device');
};

export const passkeyOnDevice = () => readFlag(ON_DEVICE);

/** "Auf diesem Gerät nicht mehr fragen" after signing in by mail */
export const stopAskingOnDevice = () => setFlag(PROMPT_OFF);

export const askingStoppedOnDevice = () => readFlag(PROMPT_OFF);

/** Only ask for a passkey where the device itself can hold one (Touch ID, Windows Hello, …) */
export const canCreatePasskeyHere = async () => {
	try {
		return (
			(await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()) ?? false
		);
	} catch {
		return false;
	}
};

const errorCode = (error: object) =>
	'code' in error && typeof error.code === 'string' ? error.code : 'failed';

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
 * `exists` when this device already holds a passkey of the account, the server excludes them.
 * The name is only stored after registering: passed to `addPasskey`, Better Auth would also
 * make it the user name that password managers show instead of the e-mail address.
 */
export const createPasskey = async (name: string): Promise<'created' | 'exists' | 'failed'> => {
	const { authClient } = await import('#lib/authClient.js');
	const { data, error } = await authClient.passkey.addPasskey();
	if (error && errorCode(error) === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') {
		rememberPasskeyOnDevice();
		return 'exists';
	}
	if (error || !data) return 'failed';
	rememberPasskeyOnDevice();
	await authClient.passkey.updatePasskey({ id: data.id, name: name.trim() || deviceName() });
	return 'created';
};

export const renamePasskey = async (id: string, name: string) => {
	const { authClient } = await import('#lib/authClient.js');
	const { error } = await authClient.passkey.updatePasskey({ id, name: name.trim() });
	return !error;
};

/**
 * With `autoFill` the browser offers the passkeys in the autofill of the e-mail field and stays
 * silent when there are none. Returns the error code, `null` when signed in.
 */
export const signInWithPasskey = async (autoFill = false) => {
	const { authClient } = await import('#lib/authClient.js');
	const { error } = await authClient.signIn.passkey({ autoFill });
	if (error) return errorCode(error);
	rememberPasskeyOnDevice();
	return null;
};

/**
 * Errors of the browser itself (cancelled, no passkey, request replaced by another one), not of
 * the server checking a passkey. The autofill stays silent about them.
 */
export const isBrowserError = (code: string) =>
	code.startsWith('ERROR_') || code === 'AUTH_CANCELLED';

export const conditionalSignInAvailable = async () => {
	try {
		return (await window.PublicKeyCredential?.isConditionalMediationAvailable?.()) ?? false;
	} catch {
		return false;
	}
};
