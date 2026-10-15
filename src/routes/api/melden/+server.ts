import { verifyCaptcha } from '#lib/server/captcha.js';
import { getDb } from '#lib/server/context.js';
import { createReport, notifyAdminsNow, reportSchema } from '#lib/server/moderation/reports.js';
import { hitRateLimit } from '#lib/server/rateLimit.js';
import { hashIp } from '#lib/server/secret.js';

const DAY = 24 * 60 * 60;

/** Reports of guests and signed in people, protected by the captcha and a daily limit */
export async function POST({ request, locals, getClientAddress, url }) {
	const body = await request.json().catch(() => null);
	const db = getDb();
	if (!(await verifyCaptcha(db, body?.captcha))) {
		return Response.json({ error: 'Die Prüfung gegen Bots ist fehlgeschlagen.' }, { status: 400 });
	}
	const parsed = reportSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const session = await locals.getSession();
	const ipHash = hashIp(getClientAddress());
	const email = session?.user.email ?? (parsed.data.email || null);
	if (parsed.data.reason === 'copyright' && !email) {
		return Response.json(
			{ error: 'Bei Urheberrechtsverletzungen brauchen wir eine E-Mail-Adresse.' },
			{ status: 400 }
		);
	}
	const allowed =
		(await hitRateLimit(db, `report:ip:${ipHash}`, 10, DAY)) &&
		(!session || (await hitRateLimit(db, `report:user:${session.user.id}`, 10, DAY)));
	if (!allowed) {
		return Response.json(
			{ error: 'Du hast heute schon viele Meldungen geschickt. Bitte versuche es morgen wieder.' },
			{ status: 429 }
		);
	}

	const result = await createReport(db, parsed.data, {
		userId: session?.user.id ?? null,
		email,
		ipHash
	});
	if ('error' in result) return Response.json({ error: result.error }, { status: 404 });
	if (parsed.data.reason === 'copyright' && !result.duplicate) {
		await notifyAdminsNow(db, url.origin, result.caseId);
	}
	return new Response(null, { status: 204 });
}
