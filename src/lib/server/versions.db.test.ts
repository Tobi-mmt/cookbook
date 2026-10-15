import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../types';
import { saveRecipe } from './recipes';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { deleteUnusedImages, listVersions, MAX_VERSIONS } from './versions';

const image = (name: string): RecipeImage => ({
	width: 100,
	height: 100,
	placeholder: '',
	variants: { avif: [{ width: 100, url: `/blob/${name}.avif` }], webp: [] }
});

describe.skipIf(!hasTestDatabase)('recipe versions', () => {
	const handle = useTestDatabase();

	test('keeps the newest versions and returns the images of pruned ones', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		const options = { cookbookId, userId: user.id };

		let pruned: RecipeImage[] = [];
		await saveRecipe(db, 'r', testInput('v1'), { ...options, image: image('first') });
		for (let index = 2; index <= MAX_VERSIONS + 1; index++) {
			({ prunedImages: pruned } = await saveRecipe(db, 'r', testInput(`v${index}`), {
				...options,
				image: image(`image-${index}`)
			}));
		}

		const versions = await listVersions(db, 'r');
		expect(versions).toHaveLength(MAX_VERSIONS);
		expect(versions[0].version).toBe(MAX_VERSIONS + 1);
		expect(pruned).toEqual([image('first')]);
	});

	test('deletes only the files of images no recipe or version shows', async () => {
		const deleted: string[] = [];
		const storage = {
			putFile: async () => '',
			deleteFiles: async (urls: string[]) => void deleted.push(...urls)
		};
		await deleteUnusedImages(handle.db, storage, [image('first'), image('image-3')]);
		expect(deleted).toEqual(['/blob/first.avif']);
	});
});
