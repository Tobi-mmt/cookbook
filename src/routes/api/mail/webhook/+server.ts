import { error } from '@sveltejs/kit';
import { MAIL_WEBHOOK_SECRET } from '$app/env/private';
import { getDb } from '#lib/server/context.js';
import { suppressAddress } from '#lib/server/mail.js';

const SUPPRESSING_EVENTS = /dropped|spam|complain|bounce|mailbox_not_found|blocklist/i;

const findRecipient = (event: Record<string, unknown>) =>
	[event.email_rcpt, event.rcpt_to, event.email_to, event.recipient].find(
		(value): value is string => typeof value === 'string' && value.includes('@')
	);

/** Scaleway Topics and Events posts bounces and spam complaints of Transactional Email here */
export async function POST({ request, url }) {
	if (!MAIL_WEBHOOK_SECRET || url.searchParams.get('secret') !== MAIL_WEBHOOK_SECRET) {
		error(401, 'Unauthorized');
	}

	const body = await request.json().catch(() => null);
	if (body?.Type === 'SubscriptionConfirmation' && typeof body.SubscribeURL === 'string') {
		await fetch(body.SubscribeURL);
		return new Response(null, { status: 204 });
	}

	const event = typeof body?.Message === 'string' ? JSON.parse(body.Message) : body;
	const type = String(event?.type ?? '');
	const recipient = event && findRecipient(event);
	if (recipient && SUPPRESSING_EVENTS.test(type)) {
		await suppressAddress(getDb(), recipient, type);
	}
	return new Response(null, { status: 204 });
}
