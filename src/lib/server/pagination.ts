export const PAGE_SIZE = 100;

export type Pagination = { page: number; size: number; shown: number; total: number };

export const readPage = (url: URL) => {
	const page = Number(url.searchParams.get('seite'));
	return Number.isInteger(page) && page > 1 ? page : 1;
};

export const pageOffset = (page: number) => (page - 1) * PAGE_SIZE;

export const pagination = (page: number, shown: number, total: number): Pagination => ({
	page,
	size: PAGE_SIZE,
	shown,
	total
});
