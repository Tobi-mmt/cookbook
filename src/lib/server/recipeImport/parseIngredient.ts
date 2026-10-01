const UNICODE_FRACTIONS: Record<string, string> = {
	'½': '1/2',
	'⅓': '1/3',
	'⅔': '2/3',
	'¼': '1/4',
	'¾': '3/4',
	'⅛': '1/8'
};

const UNITS = new Set([
	'g',
	'gr',
	'kg',
	'mg',
	'ml',
	'cl',
	'dl',
	'l',
	'liter',
	'el',
	'tl',
	'msp',
	'prise',
	'prisen',
	'bund',
	'dose',
	'dosen',
	'pck',
	'pkt',
	'päckchen',
	'packung',
	'packungen',
	'beutel',
	'becher',
	'flasche',
	'flaschen',
	'glas',
	'gläser',
	'tasse',
	'tassen',
	'zehe',
	'zehen',
	'scheibe',
	'scheiben',
	'stück',
	'stk',
	'handvoll',
	'zweig',
	'zweige',
	'blatt',
	'blätter',
	'stange',
	'stangen',
	'kopf',
	'köpfe',
	'knolle',
	'knollen',
	'würfel',
	'spritzer',
	'schuss',
	'tropfen',
	'cm'
]);

const QUANTITY =
	/^(?:(\d+)\s+(?=\d+\s*\/))?(?:(\d+)\s*\/\s*(\d+)|(\d+(?:[.,]\d+)?))(?:\s*(?:-|–|bis)\s*[\d.,/]+)?/;
const UNIT = /^([\p{L}]+)(\.?)(?:\s+|$)/u;

export interface ParsedIngredient {
	quantity: number | null;
	unit: string | null;
	name: string;
}

const parseQuantity = (match: RegExpMatchArray) => {
	const [, whole, numerator, denominator, decimal] = match;
	const value =
		Number(whole ?? 0) +
		(decimal ? Number(decimal.replace(',', '.')) : Number(numerator) / Number(denominator));
	return Number.isFinite(value) && value > 0 ? Math.round(value * 1000) / 1000 : null;
};

export const parseIngredient = (text: string): ParsedIngredient => {
	let rest = text
		.replace(/[½⅓⅔¼¾⅛]/g, (fraction) => ` ${UNICODE_FRACTIONS[fraction]}`)
		.replace(/,(\s*,)+/g, ',')
		.replace(/\s+/g, ' ')
		.trim();

	let quantity: number | null = null;
	const quantityMatch = rest.match(QUANTITY);
	if (quantityMatch) {
		quantity = parseQuantity(quantityMatch);
		rest = rest.slice(quantityMatch[0].length).trim();
	}

	let unit: string | null = null;
	const unitMatch = rest.match(UNIT);
	if (unitMatch && UNITS.has(unitMatch[1].toLowerCase()) && rest.length > unitMatch[0].length) {
		unit = unitMatch[1] + unitMatch[2];
		rest = rest.slice(unitMatch[0].length).trim();
	}

	return { quantity, unit, name: rest.replace(/^[,;:]\s*/, '') || text.trim() };
};
