import { describe, expect, test } from 'vitest';
import { pageViews } from './db/schema';
import { saveRecipe } from './recipes';
import {
	aggregateDailyViews,
	cookbookStats,
	deleteOldPageViews,
	mostVisitedRecipeIds
} from './recipeViews';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';

describe.skipIf(!hasTestDatabase)('recipe views', () => {
	const handle = useTestDatabase();

	test('aggregates unique visitors per recipe and day', async () => {
		const { db } = handle;
		const user = await createTestUser(db);
		const { id: cookbookId } = await createTestCookbook(db, user.id);
		for (const id of ['soup', 'cake']) {
			await saveRecipe(db, id, testInput(id), { cookbookId, userId: user.id });
		}
		const view = (path: string, visitorHash: string, day = '2026-10-14') => ({
			day,
			path,
			visitorHash
		});
		await db
			.insert(pageViews)
			.values([
				view('/rezept/soup/Suppe', 'a'),
				view('/rezept/soup/Suppe', 'a'),
				view('/recipe/soup/Suppe', 'b'),
				view('/rezept/cake/Kuchen', 'a'),
				view('/rezept/gone/Weg', 'a'),
				view('/@tobi', 'a'),
				view('/rezept/soup/Suppe', 'c', '2022-01-01')
			]);

		await aggregateDailyViews(db, '2026-10-14');
		await aggregateDailyViews(db, '2026-10-14');

		expect(await mostVisitedRecipeIds(db, '2026-10-01')).toEqual(['soup', 'cake']);
		const stats = await cookbookStats(db, cookbookId, '2026-10-01');
		expect(stats.perRecipe).toEqual([
			{ recipeId: 'soup', title: 'soup', visitors: 2, views: 3 },
			{ recipeId: 'cake', title: 'cake', visitors: 1, views: 1 }
		]);
		expect(stats.perDay).toEqual([{ day: '2026-10-14', visitors: 3 }]);

		await deleteOldPageViews(db, new Date('2026-10-15'));
		expect((await db.select().from(pageViews)).length).toBe(6);
	});
});
