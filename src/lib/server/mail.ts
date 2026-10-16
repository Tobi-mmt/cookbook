import { eq, lt } from 'drizzle-orm';
import { MAIL_FROM, MAIL_REPLY_TO, SCW_PROJECT_ID, SCW_SECRET_KEY } from '$app/env/private';
import type { Database } from './db/client';
import { mailLog, mailSuppressions } from './db/schema';
import { SITE_DOMAIN, SITE_NAME, SITE_TAGLINE } from '../site';

export type MailContent = { subject: string; text: string; html: string };

const SCALEWAY_URL = 'https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails';

const escapeHtml = (text: string) =>
	text.replace(
		/[&<>"']/g,
		(char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!
	);

/** A plain mail in the style of the app: paragraphs and at most one button, no images */
export const renderMail = ({
	subject,
	paragraphs,
	button,
	footer
}: {
	subject: string;
	paragraphs: string[];
	button?: { label: string; url: string };
	footer?: string;
}): MailContent => {
	const signature = `${SITE_NAME} · ${SITE_DOMAIN}\n${SITE_TAGLINE}`;
	const text = [
		SITE_NAME,
		...paragraphs,
		...(button ? [`${button.label}: ${button.url}`] : []),
		'--',
		...(footer ? [footer] : []),
		signature
	].join('\n\n');

	const html = `<!doctype html><html lang="de"><body style="margin:0;padding:32px 16px;background:#fff;color:#222;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5">
<div style="max-width:520px;margin:0 auto">
<p style="margin:0 0 24px;font-size:20px;letter-spacing:-0.01em">${SITE_NAME}</p>
${paragraphs.map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('\n')}
${button ? `<p style="margin:24px 0"><a href="${escapeHtml(button.url)}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#27343a;color:#fff;text-decoration:none">${escapeHtml(button.label)}</a></p>` : ''}
<div style="margin:32px 0 0;padding-top:16px;border-top:1px solid #ddd;color:#888;font-size:13px">
${footer ? `<p style="margin:0 0 12px">${escapeHtml(footer)}</p>` : ''}
<p style="margin:0">${SITE_NAME} · <a href="https://${SITE_DOMAIN}" style="color:#888">${SITE_DOMAIN}</a><br>${SITE_TAGLINE}</p>
</div>
</div></body></html>`;

	return { subject, text, html };
};

const parseAddress = (address: string) => {
	const match = address.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
	return match ? { name: match[1], email: match[2] } : { email: address.trim() };
};

export class MailError extends Error {}

const deliver = async (to: string, mail: MailContent) => {
	const response = await fetch(SCALEWAY_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-auth-token': SCW_SECRET_KEY! },
		body: JSON.stringify({
			from: parseAddress(MAIL_FROM ?? `${SITE_NAME} <hallo@example.com>`),
			to: [{ email: to }],
			subject: mail.subject,
			text: mail.text,
			html: mail.html,
			project_id: SCW_PROJECT_ID,
			...(MAIL_REPLY_TO ? { additional_headers: [{ key: 'Reply-To', value: MAIL_REPLY_TO }] } : {})
		})
	});
	if (!response.ok) throw new MailError(`Scaleway answered ${response.status}`);
};

export const isSuppressed = async (db: Database, email: string) =>
	Boolean(
		await db.query.mailSuppressions.findFirst({
			where: eq(mailSuppressions.email, email.toLowerCase())
		})
	);

/**
 * Sends a mail, or only logs it without a Scaleway key (local development).
 * With `retry`, a failed mail is kept and resent by the daily job instead of throwing.
 */
export const sendMail = async (
	db: Database,
	to: string,
	mail: MailContent,
	{ kind, retry = false }: { kind: string; retry?: boolean }
) => {
	if (await isSuppressed(db, to)) {
		await db.insert(mailLog).values({ recipient: to, kind, status: 'suppressed' });
		return false;
	}

	if (!SCW_SECRET_KEY) {
		console.log(`Mail to ${to}: ${mail.subject}\n\n${mail.text}`);
		await db.insert(mailLog).values({ recipient: to, kind, status: 'logged', sentAt: new Date() });
		return true;
	}

	try {
		await deliver(to, mail);
		await db
			.insert(mailLog)
			.values({ recipient: to, kind, status: 'sent', attempts: 1, sentAt: new Date() });
		return true;
	} catch (error) {
		console.error(error);
		await db.insert(mailLog).values({
			recipient: to,
			kind,
			status: retry ? 'pending' : 'failed',
			payload: retry ? mail : null,
			attempts: 1
		});
		if (!retry) throw new MailError('Die E-Mail konnte nicht verschickt werden.');
		return false;
	}
};

/** Resends pending mails, called by the daily job */
export const resendPendingMails = async (db: Database, maxAttempts = 5) => {
	const pending = await db.query.mailLog.findMany({ where: eq(mailLog.status, 'pending') });
	for (const entry of pending) {
		try {
			if (!SCW_SECRET_KEY) throw new MailError('No Scaleway key');
			await deliver(entry.recipient, entry.payload!);
			await db
				.update(mailLog)
				.set({ status: 'sent', payload: null, attempts: entry.attempts + 1, sentAt: new Date() })
				.where(eq(mailLog.id, entry.id));
		} catch {
			const attempts = entry.attempts + 1;
			await db
				.update(mailLog)
				.set({ attempts, ...(attempts >= maxAttempts ? { status: 'failed' as const } : {}) })
				.where(eq(mailLog.id, entry.id));
		}
	}
};

export const suppressAddress = (db: Database, email: string, reason: string) =>
	db.insert(mailSuppressions).values({ email: email.toLowerCase(), reason }).onConflictDoNothing();

export const MAIL_LOG_DAYS = 90;

export const deleteOldMailLog = (db: Database, now = new Date()) =>
	db
		.delete(mailLog)
		.where(lt(mailLog.createdAt, new Date(now.getTime() - MAIL_LOG_DAYS * 24 * 60 * 60 * 1000)));
