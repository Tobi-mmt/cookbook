import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import type { RecipeImage } from '../../types';
import { pageViews, recipes, users } from './db/schema';
import { loadHome } from './home';
import { saveRecipe } from './recipes';
import { copyRecipe } from './recipeTransfer';
import { aggregateDailyViews } from './recipeViews';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { trackingDay } from './tracking';

const image: RecipeImage = {
	width: 1,
	height: 1,
	placeholder: '',
	variants: { avif: [{ width: 1, url: '/blob/1.avif' }], webp: [] }
};

describe.skipIf(!hasTestDatabase)('loadHome', () => {
	const handle = useTestDatabase();
	const storage = {
		putFile: async () => '',
		deleteFiles: async () => {},
		copyFile: async (_url: string, path: string) => `/blob/${path}`
	};

	test('shows popular recipes first and new ones only with a photo of older accounts', async () => {
		const { db } = handle;
		const [old, young] = [await createTestUser(db), await createTestUser(db)];
		await db
			.update(users)
			.set({ createdAt: new Date('2020-01-01') })
			.where(eq(users.id, old.id));
		const oldBook = await createTestCookbook(db, old.id);
		const youngBook = await createTestCookbook(db, young.id);

		await saveRecipe(db, 'photo', testInput('Mit Foto'), {
			cookbookId: oldBook.id,
			userId: old.id,
			image
		});
		await saveRecipe(db, 'plain', testInput('Ohne Foto'), {
			cookbookId: oldBook.id,
			userId: old.id
		});
		await saveRecipe(db, 'young', testInput('Junges Konto'), {
			cookbookId: youngBook.id,
			userId: young.id,
			image
		});
		await copyRecipe(db, storage, {
			sourceId: 'photo',
			cookbookId: youngBook.id,
			userId: young.id
		});

		const today = trackingDay();
		await db
			.insert(pageViews)
			.values(
				['a', 'b'].map((visitorHash) => ({ day: today, path: '/rezept/plain/x', visitorHash }))
			);
		await aggregateDailyViews(db, today);

		const home = await loadHome(db);
		expect(home.popular.map(({ id }) => id)).toEqual(['plain', 'young', 'photo']);
		expect(home.fresh.map(({ id }) => id)).toEqual(['photo']);
		expect(
			(await db.select().from(recipes)).filter(({ copiedFromId }) => copiedFromId)
		).toHaveLength(1);
	});
});
