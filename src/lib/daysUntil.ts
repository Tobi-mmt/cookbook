/** Whole days until a date, at least 0, rounded up so that "in 1 Tag" lasts until the end */
export const daysUntil = (date: Date | string, now = Date.now()) =>
	Math.max(0, Math.ceil((new Date(date).getTime() - now) / (24 * 60 * 60 * 1000)));

export const inDays = (days: number) =>
	days === 0 ? 'heute' : days === 1 ? 'morgen' : `in ${days} Tagen`;
