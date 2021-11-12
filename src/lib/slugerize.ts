export const slugerize = (input: string): string => {
	if (!input) return;
	return encodeURIComponent(input.replace(/ /g, '-'));
};
