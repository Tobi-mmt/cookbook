export const slugerize = (input: string): string => {
	const inputCopy = input.slice();
	if (!inputCopy) return;
	return encodeURIComponent(inputCopy.replace(/ /g, '-'));
};
