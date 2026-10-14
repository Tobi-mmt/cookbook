export const slugerize = (input: string): string => encodeURIComponent(input.replace(/ /g, '-'));
