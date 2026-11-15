/** What a recipe yields when nothing else is given */
export const DEFAULT_PORTION_UNIT = 'Portionen';

/** Common units with singular and plural, other units are shown as entered */
const KNOWN_UNITS: [singular: string, plural: string][] = [
	['Portion', 'Portionen'],
	['Person', 'Personen'],
	['Stück', 'Stück'],
	['Muffin', 'Muffins'],
	['Cupcake', 'Cupcakes'],
	['Kuchen', 'Kuchen'],
	['Torte', 'Torten'],
	['Tarte', 'Tartes'],
	['Quiche', 'Quiches'],
	['Blech', 'Bleche'],
	['Springform', 'Springformen'],
	['Kastenform', 'Kastenformen'],
	['Auflaufform', 'Auflaufformen'],
	['Brot', 'Brote'],
	['Brötchen', 'Brötchen'],
	['Baguette', 'Baguettes'],
	['Zopf', 'Zöpfe'],
	['Pizza', 'Pizzen'],
	['Waffel', 'Waffeln'],
	['Pfannkuchen', 'Pfannkuchen'],
	['Keks', 'Kekse'],
	['Cookie', 'Cookies'],
	['Plätzchen', 'Plätzchen'],
	['Brownie', 'Brownies'],
	['Riegel', 'Riegel'],
	['Praline', 'Pralinen'],
	['Kugel', 'Kugeln'],
	['Knödel', 'Knödel'],
	['Burger', 'Burger'],
	['Wrap', 'Wraps'],
	['Glas', 'Gläser'],
	['Flasche', 'Flaschen'],
	['Becher', 'Becher'],
	['Schale', 'Schalen'],
	['Liter', 'Liter']
];

const normalize = (unit: string) => unit.trim().toLocaleLowerCase('de');

const findKnown = (unit: string) => {
	const wanted = normalize(unit);
	return KNOWN_UNITS.find((forms) => forms.some((form) => normalize(form) === wanted));
};

/** The unit in the right form for the count, e.g. "1 Portion" but "2 Portionen" */
export const portionUnitFor = (count: number, unit: string | null | undefined) => {
	const text = unit?.trim() || DEFAULT_PORTION_UNIT;
	const known = findKnown(text);
	if (!known) return text;
	return count === 1 ? known[0] : known[1];
};

/** e.g. "35 Muffins" */
export const portionLabel = (count: number, unit: string | null | undefined) =>
	`${count} ${portionUnitFor(count, unit)}`;

/** Whether the recipe is counted in servings for people rather than in pieces or baking tins */
export const isServing = (unit: string | null | undefined) => {
	const known = findKnown(unit?.trim() || DEFAULT_PORTION_UNIT);
	return known?.[0] === 'Portion' || known?.[0] === 'Person';
};

/**
 * The known unit that starts with what was typed, in the form for the count, to complete it
 * inline. Nothing for an empty input or a unit that is already complete.
 */
export const completePortionUnit = (typed: string, count: number) => {
	const wanted = normalize(typed);
	if (!wanted || findKnown(typed)) return undefined;
	const forms = (count === 1 ? [0, 1] : [1, 0]) as (0 | 1)[];
	for (const index of forms) {
		const match = KNOWN_UNITS.find((known) => normalize(known[index]).startsWith(wanted));
		if (match) return match[index];
	}
	return undefined;
};

const IMPORTED_UNITS: Record<string, string> = {
	serving: 'Portionen',
	servings: 'Portionen',
	portions: 'Portionen',
	people: 'Personen',
	persons: 'Personen',
	pieces: 'Stück',
	stk: 'Stück'
};

/** Reads count and unit from a yield like "12 Muffins" or "4 Portionen (à 300 g)" */
export const parseYield = (value: string | undefined) => {
	const matches = [...(value ?? '').matchAll(/(\d+)\s*([\p{L}][\p{L}\- ]*)?/gu)];
	const match = matches.find(([, , unit]) => unit?.trim()) ?? matches[0];
	if (!match) return undefined;
	// "2 Gläser à 400 ml" keeps "Gläser", a long phrase is no unit
	const words = (match[2] ?? '').trim().split(/\s+/);
	const end = words.findIndex((word) => word.length < 2);
	const kept = end === -1 ? words : words.slice(0, end);
	const unit = (kept.length <= 2 ? kept : kept.slice(0, 1)).join(' ');
	const count = Number(match[1]);
	return {
		count,
		unit: unit
			? (IMPORTED_UNITS[normalize(unit).replace(/\.$/, '')] ?? portionUnitFor(count, unit))
			: DEFAULT_PORTION_UNIT
	};
};
