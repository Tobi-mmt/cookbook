import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../types';
import { saveRecipe } from './recipes';
import { storageStatus } from './storageUsage';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { moveRecipeToTrash } from './trash';

const image = (name: string, uploadedBy: string, bytes: number): RecipeImage => ({
	width: 1,
	height: 1,
	placeholder: '',
	variants: { avif: [{ width: 1, url: `/blob/${name}.avif` }], webp: [] },
	bytes,
	uploadedBy
});

describe.skipIf(!hasTestDatabase)('storageStatus', () => {
	const handle = useTestDatabase();

	test('counts every own image once, also in versions and the trash', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const other = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		const options = { cookbookId, userId: user.id };

		await saveRecipe(db, 'a', testInput(), { ...options, image: image('a1', user.id, 100) });
		await saveRecipe(db, 'a', testInput(), { ...options, image: image('a2', user.id, 50) });
		await saveRecipe(db, 'a', testInput('Ohne Änderung am Bild'), options);
		await saveRecipe(db, 'b', testInput(), { ...options, image: image('b', user.id, 7) });
		await moveRecipeToTrash(db, 'b', user.id);
		await saveRecipe(db, 'c', testInput(), { ...options, image: image('c', other.id, 1000) });

		expect(await storageStatus(db, user.id)).toEqual({
			used: 157,
			limit: 100 * 1024 * 1024,
			full: false
		});
	});
});
