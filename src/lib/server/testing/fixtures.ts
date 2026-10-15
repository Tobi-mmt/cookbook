import type { RecipeInput } from '../../recipeInput';
import type { Database } from '../db/client';
import { users } from '../db/schema';
import { createCookbook } from '../cookbooks';

let counter = 0;

export const createTestUser = async (db: Database, username = `person${++counter}`) => {
	const [user] = await db
		.insert(users)
		.values({
			id: `user-${username}`,
			name: username,
			email: `${username}@example.com`,
			username,
			acceptedTermsAt: new Date()
		})
		.returning();
	return user;
};

export const createTestCookbook = async (db: Database, ownerId: string, name = 'Mein Kochbuch') =>
	createCookbook(db, ownerId, name);

export const testInput = (title = 'Dal'): RecipeInput => ({
	title,
	description: null,
	sourceUrl: null,
	portion: 2,
	duration: 30,
	categoryId: 5,
	nutritionType: 'Vegan',
	ingredients: [{ clientId: 'a', kind: 'ingredient', name: 'Linsen', quantity: 200, unit: 'g' }],
	steps: [{ kind: 'step', text: 'Linsen kochen', links: [{ ingredientId: 'a' }] }]
});
