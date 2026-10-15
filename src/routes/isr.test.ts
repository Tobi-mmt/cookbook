import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

const ROUTES = path.resolve('src/routes');
const SESSION_ACCESS =
	/\b(getSession|locals|cookies|requireUser|requireEditor|requireOwner|requireAdmin)\b/;

const serverFiles = (dir: string): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) return serverFiles(file);
		return /^\+(page\.server|server)\.ts$/.test(entry.name) ? [file] : [];
	});

/** The ISR cache ignores cookies, whatever a cached route renders for one person all would see */
test('routes cached with ISR never read the session', () => {
	const cached = serverFiles(ROUTES).filter((file) =>
		readFileSync(file, 'utf8').includes('isrConfig')
	);
	expect(cached.length).toBeGreaterThan(5);
	for (const file of cached) {
		expect(readFileSync(file, 'utf8'), path.relative(ROUTES, file)).not.toMatch(SESSION_ACCESS);
	}
});
