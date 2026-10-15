import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import { deleteAccount } from './accounts';
import { createEmailChangeToken, readEmailChangeToken } from './emailChange';
import { acceptInvitation } from './invitations';
import { cookbooks, recipes, users } from './db/schema';
import { saveRecipe } from './recipes';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestCookbook, createTestUser, testInput } from './testing/fixtures';
import { isUsernameAvailable } from './users';

describe.skipIf(!hasTestDatabase)('deleteAccount', () => {
	const handle = useTestDatabase();
	const storage = {
		putFile: async () => '',
		deleteFiles: async () => {},
		copyFile: async () => ''
	};

	test('deletes own cookbooks, hands shared ones over and blocks the username', async () => {
		const { db } = handle;
		const [leaving, staying] = [await createTestUser(db, 'leaving'), await createTestUser(db)];
		const own = await createTestCookbook(db, leaving.id, 'Allein');
		const shared = await createTestCookbook(db, leaving.id, 'Gemeinsam');
		await acceptInvitation(db, shared.id, staying.id);
		await saveRecipe(db, 'own', testInput(), { cookbookId: own.id, userId: leaving.id });
		await saveRecipe(db, 'shared', testInput(), { cookbookId: shared.id, userId: leaving.id });

		await deleteAccount(db, storage, leaving.id);

		expect(await db.query.users.findFirst({ where: eq(users.id, leaving.id) })).toBeUndefined();
		expect(await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, own.id) })).toBeUndefined();
		const handedOver = await db.query.cookbooks.findFirst({ where: eq(cookbooks.id, shared.id) });
		expect(handedOver?.ownerId).toBe(staying.id);
		const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, 'shared') });
		expect(recipe?.createdBy).toBeNull();
		expect(await isUsernameAvailable(db, 'leaving')).toBe(false);
	});
});

describe('email change token', () => {
	test('is valid for a day and cannot be forged', () => {
		const token = createEmailChangeToken('u', 'neu@example.com', 0);
		expect(readEmailChangeToken(token, 1000)).toMatchObject({
			userId: 'u',
			email: 'neu@example.com'
		});
		expect(readEmailChangeToken(token, 25 * 60 * 60 * 1000)).toBeNull();
		expect(readEmailChangeToken(token.replace(/.$/, 'x'), 1000)).toBeNull();
	});
});
