import type { ReportReason } from '#lib/server/db/schema.js';

export type ReportTarget = 'image' | 'recipe' | 'cookbook' | 'user';

export const REPORT_TARGET_LABELS: Record<ReportTarget, string> = {
	image: 'Das Bild',
	recipe: 'Das Rezept',
	cookbook: 'Das Kochbuch',
	user: 'Die Person'
};

export const REPORT_REASON_OPTIONS: {
	id: ReportReason;
	label: string;
	/** a description is required */
	needsComment?: boolean;
	/** only for these targets */
	targets?: ReportTarget[];
}[] = [
	{ id: 'inappropriate', label: 'Unangemessener Inhalt (anstößig, gewaltverherrlichend, sexuell)' },
	{ id: 'copyright', label: 'Urheberrechtsverletzung', targets: ['image', 'recipe'] },
	{ id: 'spam', label: 'Spam oder Werbung' },
	{
		id: 'dangerous',
		label: 'Gefährliche oder falsche Angaben (z. B. Lebensmittelsicherheit)',
		needsComment: true,
		targets: ['recipe']
	},
	{ id: 'personal_data', label: 'Persönliche Daten von anderen' },
	{
		id: 'harassment',
		label: 'Belästigung oder Beleidigung',
		targets: ['user', 'cookbook']
	},
	{ id: 'other', label: 'Sonstiges', needsComment: true }
];

export const reasonLabel = (reason: string) =>
	REPORT_REASON_OPTIONS.find(({ id }) => id === reason)?.label ?? reason;
