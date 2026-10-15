import type { RecipeImage } from '../types';

/** Only free licenses that allow reuse and resizing, NC and ND are not taken over */
export type LicenseId = 'CC0-1.0' | `CC-BY-${string}` | `CC-BY-SA-${string}`;

export const parseLicense = (value: string | undefined | null): LicenseId | null => {
	if (!value) return null;
	const text = value.toLowerCase();
	if (/publicdomain\/zero|(^|\W)cc0(\W|$)/.test(text)) return 'CC0-1.0';
	const match =
		text.match(/creativecommons\.org\/licenses\/([a-z-]+)\/(\d\.\d)/) ??
		text.match(/(?:^|\s)cc[ -](by(?:-sa)?|by-nc(?:-sa)?|by-nd|by-nc-nd)[ -](\d\.\d)/);
	if (!match) return null;
	const [, kind, version] = match;
	if (kind === 'by') return `CC-BY-${version}`;
	if (kind === 'by-sa') return `CC-BY-SA-${version}`;
	return null;
};

export const licenseLabel = (id: LicenseId) =>
	id === 'CC0-1.0' ? 'CC0 1.0' : id.replace(/^CC-BY-SA-/, 'CC BY-SA ').replace(/^CC-BY-/, 'CC BY ');

export const licenseUrl = (id: LicenseId) => {
	if (id === 'CC0-1.0') return 'https://creativecommons.org/publicdomain/zero/1.0/deed.de';
	const [, kind, version] = id.match(/^CC-(BY(?:-SA)?)-(.+)$/)!;
	return `https://creativecommons.org/licenses/${kind.toLowerCase()}/${version}/deed.de`;
};

/** "Foto: Max Muster, CC BY 4.0, via chefkoch.de", null for own photos */
export const imageCaption = (image: RecipeImage) => {
	if (image.license) {
		const parts = [
			image.author ? `Foto: ${image.author}` : 'Foto',
			licenseLabel(image.license),
			...(image.sourceUrl ? [`via ${new URL(image.sourceUrl).hostname.replace(/^www\./, '')}`] : [])
		];
		return parts.join(', ');
	}
	return image.aiGenerated ? 'Bild KI-generiert' : null;
};
