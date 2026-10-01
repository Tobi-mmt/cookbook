import { parse, type HTMLElement } from 'node-html-parser';

export type Instruction = string | { section: string; steps: string[] };

export interface ScrapedRecipe {
	name?: string;
	description?: string;
	image?: string;
	yield?: string;
	totalTime?: string;
	prepTime?: string;
	cookTime?: string;
	categories: string[];
	keywords: string[];
	diets: string[];
	ingredients: string[];
	instructions: Instruction[];
}

type JsonNode = Record<string, unknown>;

const toArray = <T>(value: T | T[] | undefined | null): T[] =>
	value == null ? [] : Array.isArray(value) ? value : [value];

const isObject = (value: unknown): value is JsonNode =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanText = (html: string) =>
	parse(html.replace(/<br\s*\/?>|<\/(p|li|div)>/gi, '\n'))
		.textContent.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n');

const splitLines = (text: string) => cleanText(text).split('\n').filter(Boolean);

const singleLine = (text: string) => cleanText(text).replace(/\n/g, ' ') || undefined;

const firstDefined = <T>(values: (T | undefined)[]) => values.find((value) => value !== undefined);

const isEmpty = (recipe: ScrapedRecipe) => !recipe.name && !recipe.ingredients.length;

/* JSON-LD */

const typesOf = (node: JsonNode) =>
	toArray(node['@type']).map((type) => String(type).split(/[/:#]/).pop());

const parseJson = (source: string): unknown => {
	try {
		return JSON.parse(source);
	} catch {
		try {
			return JSON.parse(source.replace(/[\n\r\t]/g, ' '));
		} catch {
			return undefined;
		}
	}
};

const collectNodes = (value: unknown, nodes: JsonNode[] = []): JsonNode[] => {
	for (const item of toArray(value)) {
		if (!isObject(item)) continue;
		nodes.push(item);
		for (const child of Object.values(item)) collectNodes(child, nodes);
	}
	return nodes;
};

const fromJsonLd = (root: HTMLElement): ScrapedRecipe | undefined => {
	const nodes = root
		.querySelectorAll('script')
		.filter((script) => script.getAttribute('type')?.toLowerCase().includes('ld+json'))
		.flatMap((script) => collectNodes(parseJson(script.rawText)));

	const byId = new Map(
		nodes.filter((node) => typeof node['@id'] === 'string').map((node) => [node['@id'], node])
	);
	const resolve = (value: unknown) =>
		isObject(value) && typeof value['@id'] === 'string' && Object.keys(value).length === 1
			? (byId.get(value['@id']) ?? value)
			: value;

	const text = (value: unknown): string | undefined => {
		value = resolve(value);
		if (typeof value === 'string') return singleLine(value);
		if (typeof value === 'number') return String(value);
		if (Array.isArray(value)) return firstDefined(value.map(text));
		if (isObject(value)) return text(value['@value'] ?? value.name ?? value.text);
		return undefined;
	};
	const texts = (value: unknown) =>
		toArray(value).flatMap((item) => toArray(text(item)?.split(',')).map((part) => part.trim()));
	const image = (value: unknown): string | undefined => {
		value = resolve(value);
		if (typeof value === 'string') return value;
		if (Array.isArray(value)) return firstDefined(value.map(image));
		if (isObject(value)) return image(value.url ?? value.contentUrl);
		return undefined;
	};
	const instructions = (value: unknown): Instruction[] =>
		toArray(value).flatMap((item): Instruction[] => {
			item = resolve(item);
			if (typeof item === 'string') return splitLines(item);
			if (!isObject(item)) return [];
			if (typesOf(item).includes('HowToSection')) {
				const steps = instructions(item.itemListElement).flatMap((step) =>
					typeof step === 'string' ? [step] : step.steps
				);
				return [{ section: text(item.name) ?? '', steps }];
			}
			if (item.itemListElement) return instructions(item.itemListElement);
			const step = text(item.text) ?? text(item.name);
			return step ? [step] : [];
		});

	const recipe = nodes.find((node) => typesOf(node).includes('Recipe'));
	if (!recipe) return undefined;

	return {
		name: text(recipe.name) ?? text(recipe.headline),
		description: text(recipe.abstract) ?? text(recipe.description),
		image: image(recipe.image) ?? image(recipe.thumbnailUrl),
		yield: texts(recipe.recipeYield).join(' ') || undefined,
		totalTime: text(recipe.totalTime),
		prepTime: text(recipe.prepTime),
		cookTime: text(recipe.cookTime),
		categories: texts(recipe.recipeCategory),
		keywords: texts(recipe.keywords),
		diets: texts(recipe.suitableForDiet).map((diet) => diet.split('/').pop()!),
		ingredients: toArray(recipe.recipeIngredient ?? recipe.ingredients).flatMap(
			(item) => text(item) ?? []
		),
		instructions: instructions(recipe.recipeInstructions)
	};
};

/* Microdata and microformats */

const propertyValue = (element: HTMLElement) => {
	const attribute = { meta: 'content', img: 'src', link: 'href', a: 'href', time: 'datetime' }[
		element.tagName.toLowerCase()
	];
	return (
		(attribute && element.getAttribute(attribute)) ??
		element.getAttribute('content') ??
		element.textContent
	);
};

const listInstructions = (elements: HTMLElement[]): string[] =>
	elements.flatMap((element) => {
		const items = element.querySelectorAll('li');
		return items.length
			? items.flatMap((item) => singleLine(item.innerHTML) ?? [])
			: splitLines(element.innerHTML);
	});

const fromMicrodata = (root: HTMLElement): ScrapedRecipe | undefined => {
	const scope = root
		.querySelectorAll('[itemscope]')
		.find((element) => /schema\.org\/Recipe$/i.test(element.getAttribute('itemtype') ?? ''));
	if (!scope) return undefined;

	const ownerScope = (element: HTMLElement) => {
		let parent = element.parentNode;
		while (parent && !parent.hasAttribute('itemscope')) parent = parent.parentNode;
		return parent;
	};
	const elements = (...names: string[]) =>
		scope.querySelectorAll('[itemprop]').filter(
			(element) =>
				ownerScope(element) === scope &&
				element
					.getAttribute('itemprop')!
					.split(/\s+/)
					.some((name) => names.includes(name))
		);
	const values = (...names: string[]) =>
		elements(...names).flatMap((element) => singleLine(propertyValue(element)) ?? []);
	const value = (...names: string[]) => values(...names)[0];

	const stepElements = elements('recipeInstructions');
	const nestedSteps = stepElements.flatMap((element) =>
		element.querySelectorAll('[itemprop~="text"]')
	);

	return {
		name: value('name'),
		description: value('description'),
		image: value('image'),
		yield: value('recipeYield'),
		totalTime: value('totalTime'),
		prepTime: value('prepTime'),
		cookTime: value('cookTime'),
		categories: values('recipeCategory'),
		keywords: values('keywords').flatMap((keyword) => keyword.split(',').map((k) => k.trim())),
		diets: values('suitableForDiet').map((diet) => diet.split('/').pop()!),
		ingredients: values('recipeIngredient', 'ingredients'),
		instructions: nestedSteps.length
			? nestedSteps.flatMap((element) => singleLine(element.innerHTML) ?? [])
			: listInstructions(stepElements)
	};
};

const fromMicroformats = (root: HTMLElement): ScrapedRecipe | undefined => {
	const scope = root.querySelector('.h-recipe, .hrecipe');
	if (!scope) return undefined;

	const all = (selector: string) => scope.querySelectorAll(selector);
	const value = (selector: string) => {
		const element = scope.querySelector(selector);
		return element ? singleLine(propertyValue(element)) : undefined;
	};

	return {
		name: value('.p-name, .fn'),
		description: value('.p-summary, .summary'),
		image: value('.u-photo, .photo'),
		yield: value('.p-yield, .yield'),
		totalTime: value('.dt-duration, .duration'),
		categories: all('.p-category, .category').flatMap((e) => singleLine(e.textContent) ?? []),
		keywords: [],
		diets: [],
		ingredients: all('.p-ingredient, .ingredient').flatMap((e) => singleLine(e.textContent) ?? []),
		instructions: listInstructions(all('.e-instructions, .instructions'))
	};
};

export const extractRecipe = (html: string): ScrapedRecipe | undefined => {
	const root = parse(html);
	return [fromJsonLd, fromMicrodata, fromMicroformats]
		.map((extract) => extract(root))
		.find((recipe) => recipe && !isEmpty(recipe));
};
