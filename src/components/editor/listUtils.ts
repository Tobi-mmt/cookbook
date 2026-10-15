/** Moves an item up (-1) or down (1) within the list */
export const move = <T>(list: T[], index: number, direction: -1 | 1) => {
	const target = index + direction;
	if (target < 0 || target >= list.length) return;
	[list[index], list[target]] = [list[target], list[index]];
};

export const newClientId = () => `new-${crypto.randomUUID()}`;
