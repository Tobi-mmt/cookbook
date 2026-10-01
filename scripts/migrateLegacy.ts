/**
 * One-off import of the recipes that used to live in src/lib/recipes/<slug>/recipe.ts.
 * Idempotent: running it again replaces the recipes with the same id.
 *
 * Local:      yarn migrate:legacy                        (Podman Postgres + .data/blob)
 * Production: vercel env pull --environment=production .env.production.local
 *             yarn tsx --env-file=.env.production.local scripts/migrateLegacy.ts
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { glob } from 'node:fs/promises';
import { createServer } from 'vite';
import type { Ingredient, Recipe, Section, Step } from '../src/types';
import type { RecipeInput } from '../src/lib/recipeInput';
import { recipeInputSchema } from '../src/lib/recipeInput';
import { createDb } from '../src/lib/server/db/client';
import { processAndStoreImage } from '../src/lib/server/images';
import { getRecipe, saveRecipe } from '../src/lib/server/recipes';
import { createStorage } from '../src/lib/server/storage';

type LegacyRecipe = Omit<Recipe, 'image'> & { image: string; placeholderImage: string };

const isSection = (value: object): value is Section => 'section' in value;

if (!process.env.POSTGRES_URL) {
	console.error('POSTGRES_URL is not set');
	process.exit(1);
}

const loadLegacyRecipes = async (): Promise<LegacyRecipe[]> => {
	// resolves `./image.webp?enhanced` to the absolute file path instead of running enhanced-img
	const vite = await createServer({
		configFile: false,
		logLevel: 'error',
		server: { middlewareMode: true, hmr: false },
		plugins: [
			{
				name: 'legacy-enhanced-image-path',
				enforce: 'pre',
				async resolveId(source, importer) {
					if (!source.endsWith('?enhanced') || !importer) return;
					return (
						'\0legacy-image:' +
						path.resolve(path.dirname(importer), source.replace('?enhanced', ''))
					);
				},
				load(id) {
					if (id.startsWith('\0legacy-image:')) {
						return `export default ${JSON.stringify(id.slice('\0legacy-image:'.length))};`;
					}
				}
			}
		]
	});

	const recipes: LegacyRecipe[] = [];
	for await (const file of glob('src/lib/recipes/*/recipe.ts')) {
		const module = await vite.ssrLoadModule(path.resolve(file));
		const recipe = Object.values(module).find(
			(value): value is LegacyRecipe => typeof value === 'object' && value !== null && 'id' in value
		);
		if (!recipe) throw new Error(`No recipe export found in ${file}`);
		recipes.push(recipe);
	}
	await vite.close();
	return recipes;
};

const sameIngredient = (a: Ingredient, b: Ingredient) =>
	a.name === b.name && (a.unit ?? null) === (b.unit ?? null);
const sameQuantity = (a: Ingredient, b: Ingredient) =>
	(a.quantity ?? null) === (b.quantity ?? null);

/** Converts a legacy recipe into the editor input format, resolving the linked ingredients */
const toInput = (recipe: LegacyRecipe): RecipeInput => {
	const ingredients = recipe.ingredients.map((ingredient, index) =>
		isSection(ingredient)
			? { clientId: String(index), kind: 'section' as const, name: ingredient.section }
			: {
					clientId: String(index),
					kind: 'ingredient' as const,
					name: ingredient.name,
					quantity: ingredient.quantity ?? null,
					unit: ingredient.unit ?? null
				}
	);
	const linked = new Set<string>();

	const steps = recipe.steps.map((step, stepIndex) => {
		if (isSection(step)) return { kind: 'section' as const, text: step.section, links: [] };
		const links = (step as Step).linkedIngredients?.map((linkedIngredient) => {
			const sameName = recipe.ingredients
				.map((ingredient, index) => ({
					ingredient: ingredient as Ingredient,
					clientId: String(index)
				}))
				.filter(
					({ ingredient }) => !isSection(ingredient) && sameIngredient(ingredient, linkedIngredient)
				);
			const exact = sameName.filter(({ ingredient }) => sameQuantity(ingredient, linkedIngredient));
			// a step may use only a part of an ingredient, e.g. half of the broth
			const candidates = exact.length ? exact : sameName;
			if (!candidates.length) {
				throw new Error(
					`${recipe.title}: step ${stepIndex + 1} links unknown ingredient "${linkedIngredient.name}"`
				);
			}
			const match = candidates.find(({ clientId }) => !linked.has(clientId)) ?? candidates[0];
			if (candidates.length > 1) {
				console.warn(
					`  ⚠ ${recipe.title}: "${linkedIngredient.name}" is ambiguous, linked ingredient #${match.clientId}`
				);
			}
			linked.add(match.clientId);
			return {
				ingredientId: match.clientId,
				quantity: exact.length ? null : (linkedIngredient.quantity ?? null)
			};
		});
		return { kind: 'step' as const, text: step.description, links: links ?? [] };
	});

	return recipeInputSchema.parse({
		title: recipe.title,
		description: recipe.description ?? null,
		portion: recipe.meta.portion,
		duration: recipe.meta.duration,
		category: recipe.meta.category,
		nutritionType: recipe.meta.nutritionType,
		ingredients,
		steps
	});
};

/** Removes the fields that are expected to differ between the legacy files and the database */
const comparable = (recipe: Omit<Recipe, 'image'>) =>
	JSON.parse(
		JSON.stringify({ ...recipe, image: undefined, placeholderImage: undefined }, (key, value) =>
			// an empty unit renders the same as no unit
			key === 'key' || (key === 'unit' && value === '') ? undefined : value
		)
	);

const { db, pool } = createDb(process.env.POSTGRES_URL);
const storage = createStorage(process.env.BLOB_READ_WRITE_TOKEN);
console.log(
	`Storage: ${process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob' : 'local (.data/blob)'}, database: ${new URL(process.env.POSTGRES_URL).host}`
);

const legacyRecipes = await loadLegacyRecipes();
let differences = 0;

for (const legacy of legacyRecipes) {
	console.log(`→ ${legacy.title} (${legacy.id})`);
	const input = toInput(legacy);
	const existing = await getRecipe(db, legacy.id);
	// do not upload the image again when re-running the migration
	const image =
		existing?.image ??
		(await processAndStoreImage(await readFile(legacy.image), legacy.id, storage));
	await saveRecipe(db, legacy.id, input, image);

	const stored = await getRecipe(db, legacy.id);
	if (!stored || !isDeepStrictEqual(comparable(stored), comparable(legacy))) {
		differences++;
		console.error(`  ✗ stored recipe differs from the legacy recipe`);
		console.error('    legacy:', JSON.stringify(comparable(legacy)));
		console.error('    stored:', JSON.stringify(stored && comparable(stored)));
	}
}

await pool.end();
console.log(`\nMigrated ${legacyRecipes.length} recipes, ${differences} with differences.`);
process.exit(differences ? 1 : 0);
