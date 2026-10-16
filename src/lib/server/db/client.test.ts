import { describe, expect, test } from 'vitest';
import { withExplicitSslMode } from './client';

describe('withExplicitSslMode', () => {
	test('replaces the aliases of verify-full', () => {
		expect(
			withExplicitSslMode('postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=require')
		).toBe('postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=verify-full');
	});

	test('keeps other connection strings as they are', () => {
		const local = 'postgres://postgres:postgres@localhost:5432/postgres';
		expect(withExplicitSslMode(local)).toBe(local);
		const disabled = `${local}?sslmode=disable`;
		expect(withExplicitSslMode(disabled)).toBe(disabled);
	});
});
