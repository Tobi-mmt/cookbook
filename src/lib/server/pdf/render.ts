import { renderSVG } from 'uqr';
import type { Ingredient, Recipe, RecipeImage, Section, Step } from '../../../types';
import { imageCaption, licenseUrl } from '../../imageLicense';
import { recipeUrl } from '../../recipeText';
import { SITE_DOMAIN } from '../../site';
import template from './cookbook.typ?raw';
import regular from './fonts/RobotoSerif_400Regular.ttf?inline';
import italic from './fonts/RobotoSerif_400Regular_Italic.ttf?inline';
import semiBold from './fonts/RobotoSerif_600SemiBold.ttf?inline';
import bold from './fonts/RobotoSerif_700Bold.ttf?inline';
import {
	bestSource,
	COVER_MM,
	imageLayout,
	type ImageLayout,
	type PdfQuality
} from '../../printLayout';
import { toPrintJpeg } from './printImage';

/** A folder that does not exist, Typst sees only the files mapped into it, never the disk */
const WORKSPACE = '/cookbook-pdf';

/** Converting images takes the most time, a few run in parallel without using too much memory */
const IMAGE_CONCURRENCY = 2;

export type PdfInput = {
	cookbook: { name: string; url: string; members: string[] };
	/** visible recipes in the order of the book */
	recipes: Recipe[];
	cover: RecipeImage | null;
	origin: string;
	now?: Date;
};

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** 1.5 → "1½", 0.3 → "0,3" */
export const formatQuantity = (quantity: number) => {
	const whole = Math.floor(quantity);
	const fraction = FRACTIONS[Math.round((quantity - whole) * 100) / 100];
	if (fraction) return `${whole || ''}${fraction}`;
	return quantity.toLocaleString('de-DE', { maximumFractionDigits: 2 });
};

const amount = ({ quantity, unit }: Ingredient) =>
	[quantity ? formatQuantity(quantity) : null, unit].filter(Boolean).join(' ');

const isSection = (item: Ingredient | Section | Step): item is Section =>
	'section' in item && Boolean(item.section);

/** "Mona", "Mona und Tobi", "Anna, Mona und Tobi" */
export const joinNames = (names: string[]) =>
	names.length > 1 ? `${names.slice(0, -1).join(', ')} und ${names.at(-1)}` : (names[0] ?? '');

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** Who wrote the recipe and what it is based on, required by CC BY-SA */
const credits = (recipe: Recipe) => {
	const based = recipe.attribution[0];
	const origin = [
		recipe.author ? `Rezept von ${recipe.author.name}` : null,
		based ? `nach „${based.title}“${based.author ? ` von ${based.author.name}` : ''}` : null,
		recipe.sourceUrl ? `Quelle: ${hostOf(recipe.sourceUrl)}` : null
	].filter(Boolean);
	const caption = recipe.image && imageCaption(recipe.image);
	return [origin.join(' · '), caption].filter((line): line is string => Boolean(line));
};

const mapLimited = async <T, R>(items: T[], limit: number, map: (item: T) => Promise<R>) => {
	const results: R[] = new Array(items.length);
	let next = 0;
	const worker = async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await map(items[index]);
		}
	};
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
};

const fontBuffer = (dataUrl: string) =>
	Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

const loadCompiler = async () => {
	// imported on demand, so that only the function of the PDF route carries the native binary
	const typst = await import('@myriaddreamin/typst-ts-node-compiler');
	const { NodeCompiler } =
		'NodeCompiler' in typst ? typst : (typst as { default: typeof typst }).default;
	return NodeCompiler.create({
		workspace: WORKSPACE,
		fontArgs: [{ fontBlobs: [regular, italic, semiBold, bold].map(fontBuffer) }]
	});
};

/** Renders the PDF, `readFile` loads a stored image by its URL */
export const renderCookbookPdf = async (
	input: PdfInput,
	quality: PdfQuality,
	readFile: (url: string) => Promise<Buffer>
) => {
	const now = input.now ?? new Date();
	const files = new Map<string, Buffer>();

	const categories: { name: string; color: string; recipes: { id: string; title: string }[] }[] =
		[];
	for (const recipe of input.recipes) {
		const { name, color } = recipe.meta.category;
		if (categories.at(-1)?.name !== name) categories.push({ name, color, recipes: [] });
		categories.at(-1)!.recipes.push({ id: recipe.id, title: recipe.title });
	}

	const images = await mapLimited(input.recipes, IMAGE_CONCURRENCY, async (recipe) => {
		const source = recipe.image && bestSource(recipe.image);
		const layout = source && imageLayout(source);
		if (!source || !layout) return null;
		const path = `/images/${recipe.id}.jpg`;
		files.set(path, await toPrintJpeg(await readFile(source.url), source, layout, quality));
		return { path, ...layout } satisfies ImageLayout & { path: string };
	});

	const coverSource = input.cover && bestSource(input.cover);
	if (coverSource) {
		files.set(
			'/images/cover.jpg',
			await toPrintJpeg(await readFile(coverSource.url), coverSource, COVER_MM, quality)
		);
	}

	files.set('/qr/cookbook.svg', Buffer.from(renderSVG(input.cookbook.url, { border: 0 })));
	const recipes = input.recipes.map((recipe, index) => {
		const url = recipeUrl(recipe, input.origin);
		const qr = `/qr/${recipe.id}.svg`;
		files.set(qr, Buffer.from(renderSVG(url, { border: 0 })));
		const categoryIndex = categories.findIndex(({ name }) => name === recipe.meta.category.name);
		return {
			id: recipe.id,
			title: recipe.title,
			category: {
				name: recipe.meta.category.name,
				color: recipe.meta.category.color,
				tab: categoryIndex
			},
			firstOfCategory: categories[categoryIndex].recipes[0].id === recipe.id,
			portion: recipe.meta.portion,
			meta: [
				`${recipe.meta.portion} ${recipe.meta.portion === 1 ? 'Portion' : 'Portionen'}`,
				`${recipe.meta.duration} min`,
				recipe.meta.nutritionType
			].join(' · '),
			description: recipe.description ?? null,
			image: images[index],
			ingredients: recipe.ingredients.map((item) =>
				isSection(item) ? { section: item.section } : { amount: amount(item), name: item.name }
			),
			steps: recipe.steps.map((step) =>
				isSection(step)
					? { section: step.section }
					: {
							text: step.description,
							uses: step.linkedIngredients?.length
								? step.linkedIngredients
										.map((item) => [amount(item), item.name].filter(Boolean).join(' '))
										.join(', ')
								: null
						}
			),
			credits: credits(recipe),
			qr
		};
	});

	const data = {
		cookbook: {
			name: input.cookbook.name,
			members: joinNames(input.cookbook.members),
			authors: input.cookbook.members,
			url: input.cookbook.url,
			qr: '/qr/cookbook.svg'
		},
		site: SITE_DOMAIN,
		date: new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'Europe/Berlin' }).format(
			now
		),
		accent: input.recipes[0]?.meta.category.color ?? '#DD5D58',
		cover: coverSource ? { path: '/images/cover.jpg', height: COVER_MM.height } : null,
		categories,
		recipes,
		imageCredits: input.recipes.flatMap(({ title, image }) =>
			image?.license
				? [{ title, caption: imageCaption(image)!, licenseUrl: licenseUrl(image.license) }]
				: []
		)
	};

	const compiler = await loadCompiler();
	for (const [path, content] of files) compiler.mapShadow(WORKSPACE + path, content);
	const result = compiler.compile({
		mainFileContent: template,
		inputs: { data: JSON.stringify(data) }
	});
	const diagnostics = result.takeDiagnostics();
	if (!result.result) {
		const messages = diagnostics ? compiler.fetchDiagnostics(diagnostics) : [];
		throw new Error(`Typst failed: ${JSON.stringify(messages)}`);
	}
	return { pdf: compiler.pdf(result.result), pages: result.result.numOfPages };
};
