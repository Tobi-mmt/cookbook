import { createHash } from 'node:crypto';
import { and, eq, inArray, ne } from 'drizzle-orm';
import type { Database } from './db/client';
import { cookbookExports, type CookbookRow } from './db/schema';
import { bestSource, imageLayout, type PdfQuality } from '../printLayout';
import type { PdfInput } from './pdf/render';
import { listCookbooksWithMembers } from './profiles';
import { listCookbookRecipes } from './recipes';
import { readStoredFile, type Storage } from './storage';
import { slugerize } from '../slugerize';

/** A hard limit, more recipes would take too long and too much memory to render */
export const PDF_RECIPE_LIMIT = 75;

/** Raise it when `cookbook.typ` or the image handling changes, so that old PDFs are replaced */
const LAYOUT_VERSION = 1;

export const PDF_QUALITIES: PdfQuality[] = ['lesen', 'druck'];

/** Everything the PDF shows, recipes in the order of the cookbook page */
export const loadPdfInput = async (
	db: Database,
	cookbook: Pick<CookbookRow, 'id' | 'name' | 'slug' | 'coverRecipeId'>,
	origin: string
): Promise<PdfInput> => {
	const [[withMembers], recipes] = await Promise.all([
		listCookbooksWithMembers(db, { cookbookId: cookbook.id }),
		listCookbookRecipes(db, cookbook.id)
	]);
	const printsWell = (recipe: (typeof recipes)[number]) => {
		const source = recipe.image && bestSource(recipe.image);
		return Boolean(source && imageLayout(source)?.layout === 'full');
	};
	const cover =
		recipes.find((recipe) => recipe.id === cookbook.coverRecipeId && recipe.image) ??
		recipes.find(printsWell);
	const ownerUsername = withMembers?.ownerUsername ?? '';
	return {
		cookbook: {
			name: cookbook.name,
			url: new URL(`/@${ownerUsername}/${cookbook.slug}`, origin).href,
			members: withMembers?.members.map(({ name }) => name) ?? []
		},
		recipes,
		cover: cover?.image ?? null,
		origin
	};
};

/** Changes whenever anything shown in the PDF changes, "new" badges are not shown */
const exportKey = (input: PdfInput, quality: PdfQuality) =>
	createHash('sha256')
		.update(
			JSON.stringify({
				LAYOUT_VERSION,
				quality,
				input: {
					...input,
					now: undefined,
					recipes: input.recipes.map((recipe) => ({ ...recipe, isNew: undefined }))
				}
			})
		)
		.digest('hex')
		.slice(0, 20);

/** The PDFs that match the current state of the cookbook */
export const findCurrentExports = async (db: Database, cookbookId: string, input: PdfInput) => {
	const rows = await db
		.select()
		.from(cookbookExports)
		.where(
			and(
				eq(cookbookExports.cookbookId, cookbookId),
				inArray(
					cookbookExports.key,
					PDF_QUALITIES.map((quality) => exportKey(input, quality))
				)
			)
		);
	return Object.fromEntries(
		rows.map((row) => [row.quality, { url: row.url, bytes: row.bytes, pages: row.pages }])
	) as Partial<Record<PdfQuality, { url: string; bytes: number; pages: number }>>;
};

/** Returns the stored PDF of this state or renders and stores a new one */
export const createExport = async (
	db: Database,
	storage: Storage,
	{ cookbookId, input, quality }: { cookbookId: string; input: PdfInput; quality: PdfQuality }
) => {
	const key = exportKey(input, quality);
	const existing = await db.query.cookbookExports.findFirst({
		where: and(
			eq(cookbookExports.cookbookId, cookbookId),
			eq(cookbookExports.quality, quality),
			eq(cookbookExports.key, key)
		)
	});
	if (existing) return existing;

	// loaded on demand, the native Typst binary and the fonts are only needed here
	const { renderCookbookPdf } = await import('./pdf/render');
	const { pdf, pages } = await renderCookbookPdf(input, quality, readStoredFile);
	const name = `${slugerize(input.cookbook.name).toLowerCase() || 'kochbuch'}${quality === 'lesen' ? '' : '-druck'}`;
	const url = await storage.putFile(
		`exports/cookbooks/${cookbookId}/${key}/${name}.pdf`,
		pdf,
		'application/pdf'
	);
	const [row] = await db
		.insert(cookbookExports)
		.values({ cookbookId, quality, key, url, bytes: pdf.length, pages })
		.onConflictDoUpdate({
			target: [cookbookExports.cookbookId, cookbookExports.quality, cookbookExports.key],
			set: { url, bytes: pdf.length, pages }
		})
		.returning();

	// older states of the cookbook are not needed anymore
	const outdated = await db
		.delete(cookbookExports)
		.where(
			and(
				eq(cookbookExports.cookbookId, cookbookId),
				eq(cookbookExports.quality, quality),
				ne(cookbookExports.key, key)
			)
		)
		.returning({ url: cookbookExports.url });
	await storage.deleteFiles(outdated.map(({ url }) => url)).catch(console.error);
	return row;
};
