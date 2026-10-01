/**
 * Copies all recipes from another database (e.g. production) into the local one,
 * including the images, which are stored with the local storage driver.
 *
 *   vercel env pull --environment=production .env.production.local
 *   SOURCE_DATABASE_URL=<DATABASE_URL from that file> yarn seed:from-prod
 *
 * The source database is only read.
 */
import { createDb } from '../src/lib/server/db/client';
import { processAndStoreImage } from '../src/lib/server/images';
import { getRecipeInput, listRecipeIndex, saveRecipe } from '../src/lib/server/recipes';
import { createLocalStorage } from '../src/lib/server/storage';

const { SOURCE_DATABASE_URL, DATABASE_URL } = process.env;
if (!SOURCE_DATABASE_URL || !DATABASE_URL) {
	console.error('SOURCE_DATABASE_URL and DATABASE_URL must be set');
	process.exit(1);
}
if (SOURCE_DATABASE_URL === DATABASE_URL) {
	console.error('SOURCE_DATABASE_URL and DATABASE_URL must differ');
	process.exit(1);
}

const source = createDb(SOURCE_DATABASE_URL);
const target = createDb(DATABASE_URL);
const storage = createLocalStorage();

for (const { id, title } of await listRecipeIndex(source.db)) {
	console.log(`→ ${title}`);
	const recipe = (await getRecipeInput(source.db, id))!;

	let image = null;
	const largest = recipe.image?.variants.webp.at(-1);
	if (largest) {
		const response = await fetch(largest.url);
		if (!response.ok) throw new Error(`Downloading ${largest.url} failed: ${response.status}`);
		image = await processAndStoreImage(Buffer.from(await response.arrayBuffer()), id, storage);
	}
	await saveRecipe(target.db, id, recipe.input, image);
}

await Promise.all([source.pool.end(), target.pool.end()]);
console.log('Done');
