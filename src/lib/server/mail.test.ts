import { describe, expect, test } from 'vitest';
import { renderMail } from './mail';

describe('renderMail', () => {
	const mail = renderMail({
		subject: 'Dein Anmelde-Link',
		paragraphs: ['Hallo <Tobi>,', 'klicke auf den Link.'],
		button: { label: 'Anmelden', url: 'https://example.com/?a=1&b=2' },
		footer: 'Du hast die Anmeldung nicht angefordert? Dann ignoriere diese Mail.'
	});

	test('creates a text version with the link', () => {
		expect(mail.text).toBe(
			'Hallo <Tobi>,\n\nklicke auf den Link.\n\nAnmelden: https://example.com/?a=1&b=2\n\n--\n\nDu hast die Anmeldung nicht angefordert? Dann ignoriere diese Mail.'
		);
	});

	test('escapes the html version and loads nothing from other servers', () => {
		expect(mail.html).toContain('Hallo &lt;Tobi&gt;,');
		expect(mail.html).toContain('href="https://example.com/?a=1&amp;b=2"');
		expect(mail.html).not.toMatch(/<img|src=/);
	});
});
