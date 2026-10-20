const TRACKING_PARAMETER =
	/^(utm_.+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|ref|ref_src)$/i;

/** The address of a recipe without tracking parameters and anchor, as its source */
export const cleanSourceUrl = (value: string) => {
	const url = new URL(value);
	for (const key of [...url.searchParams.keys()]) {
		if (TRACKING_PARAMETER.test(key)) url.searchParams.delete(key);
	}
	url.hash = '';
	return url.toString();
};
