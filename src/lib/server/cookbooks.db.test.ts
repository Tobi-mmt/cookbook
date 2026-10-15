import { describe, expect, test } from 'vitest';
import {
	createCookbook,
	ensureCookbook,
	findMovedCookbook,
	listEditableCookbooks,
	removeEditor,
	renameCookbook,
	transferCookbook
} from './cookbooks';
import { acceptInvitation, createInvitation, findInvitation } from './invitations';
import { hasTestDatabase, useTestDatabase } from './testing/db';
import { createTestUser } from './testing/fixtures';

describe.skipIf(!hasTestDatabase)('cookbooks', () => {
	const handle = useTestDatabase();

	test('gives reserved and taken slugs a number', async () => {
		const owner = await createTestUser(handle.db);
		expect((await createCookbook(handle.db, owner.id, 'Weihnachten')).slug).toBe('weihnachten');
		expect((await createCookbook(handle.db, owner.id, 'Weihnachten')).slug).toBe('weihnachten-2');
		expect((await createCookbook(handle.db, owner.id, 'Einstellungen')).slug).toBe(
			'einstellungen-2'
		);
	});

	test('redirects renamed and transferred cookbooks', async () => {
		const { db } = handle;
		const [owner, editor] = [await createTestUser(db), await createTestUser(db)];
		const { id } = await createCookbook(db, owner.id, 'Grillen');
		await acceptInvitation(db, id, editor.id);

		await renameCookbook(db, id, 'Sommer');
		expect(await findMovedCookbook(db, owner.id, 'grillen')).toEqual({
			slug: 'sommer',
			username: owner.username
		});

		await transferCookbook(db, id, editor.id);
		expect(await findMovedCookbook(db, owner.id, 'sommer')).toEqual({
			slug: 'sommer',
			username: editor.username
		});
		const roles = (await listEditableCookbooks(db, owner.id)).map(({ role }) => role);
		expect(roles).toEqual(['editor']);
	});

	test('accepts usable invitations only and keeps one cookbook for everybody', async () => {
		const { db } = handle;
		const [owner, guest] = [await createTestUser(db), await createTestUser(db)];
		const { id } = await createCookbook(db, owner.id, 'Familie');
		const token = await createInvitation(db, { cookbookId: id, createdBy: owner.id });
		expect((await findInvitation(db, token))?.usable).toBe(true);
		expect(await findInvitation(db, 'wrong')).toBeNull();

		await acceptInvitation(db, id, guest.id);
		await removeEditor(db, id, guest.id);
		await ensureCookbook(db, guest.id);
		expect((await listEditableCookbooks(db, guest.id)).map(({ name }) => name)).toEqual([
			'Mein Kochbuch'
		]);
	});
});
