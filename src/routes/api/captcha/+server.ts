import { createCaptchaChallenge } from '#lib/server/captcha.js';

export async function GET() {
	return Response.json(await createCaptchaChallenge(), {
		headers: { 'cache-control': 'no-store' }
	});
}
