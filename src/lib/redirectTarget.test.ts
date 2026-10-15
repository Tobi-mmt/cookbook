import { expect, test } from 'vitest';
import { safeRedirectTarget } from './redirectTarget';

test.each([
	['/@tobi', '/@tobi'],
	['//evil.example', '/'],
	['/\\evil.example', '/'],
	['https://evil.example', '/'],
	[null, '/']
])('safeRedirectTarget(%s)', (target, expected) => {
	expect(safeRedirectTarget(target)).toBe(expected);
});
