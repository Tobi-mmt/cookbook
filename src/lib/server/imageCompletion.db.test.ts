import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../types';
import { recipes, recipeVersions } from './db/schema';
import { completeImage } from './imageCompletion';
import { saveRecipe } from './recipes';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

const preview = (name: string): RecipeImage => ({
	width: 1,
	height: 1,
	placeholder: '',
	variants: { avif: [], webp: [{ width: 1, url: `/blob/${name}.webp` }] },
	bytes: 10
});
const avif = { variants: [{ width: 1, url: '/blob/a.avif' }], bytes: 5 };

describe.skipIf(!hasTestDatabase)('completeImage', () => {
	const handle = useTestDatabase();

	const setup = async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		await saveRecipe(db, 'r', testInput(), { cookbookId, userId: user.id, image: preview('p') });
		return { db, cookbookId };
	};

	test('adds the AVIF variants to the recipe and its version', async () => {
		const { db, cookbookId } = await setup();
		const deleted: string[] = [];
		const storage = {
			putFile: async () => '',
			copyFile: async () => '',
			deleteFiles: async (urls: string[]) => void deleted.push(...urls)
		};

		await completeImage(db, storage, {
			webpUrl: '/blob/p.webp',
			createAvif: async () => avif,
			origin: 'http://localhost',
			cookbookId,
			recipe: { id: 'r', title: 'Dal' }
		});

		const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, 'r') });
		expect(recipe?.image?.variants.avif).toEqual(avif.variants);
		expect(recipe?.image?.bytes).toBe(15);
		const [version] = await db
			.select()
			.from(recipeVersions)
			.where(eq(recipeVersions.recipeId, 'r'));
		expect(version.snapshot.image?.variants.avif).toEqual(avif.variants);
		expect(deleted).toEqual([]);
	});

	test('deletes the files again when the image was replaced meanwhile', async () => {
		const { db, cookbookId } = await setup();
		const deleted: string[] = [];
		const storage = {
			putFile: async () => '',
			copyFile: async () => '',
			deleteFiles: async (urls: string[]) => void deleted.push(...urls)
		};

		await completeImage(db, storage, {
			webpUrl: '/blob/other.webp',
			createAvif: async () => avif,
			origin: 'http://localhost',
			cookbookId,
			recipe: { id: 'r', title: 'Dal' }
		});

		expect(deleted).toEqual(['/blob/a.avif']);
	});
});
