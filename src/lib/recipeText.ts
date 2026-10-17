import type { Ingredient, Recipe, Section, Step } from '../types';
import { slugerize } from './slugerize';
import { SITE_NAME } from './site';

export const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

const DIETS: Partial<Record<Recipe['meta']['nutritionType'], string>> = {
	Vegan: 'https://schema.org/VeganDiet',
	Vegetarisch: 'https://schema.org/VegetarianDiet'
};

const isSection = (item: Ingredient | Section | Step): item is Section =>
	'section' in item && Boolean(item.section);

export const ingredientText = ({ quantity, unit, name }: Ingredient) =>
	[quantity ? quantity.toLocaleString('de-DE') : null, unit, name].filter(Boolean).join(' ');

const absolute = (path: string, origin: string) => new URL(path, origin).href;

export const recipeUrl = (recipe: { id: string; title: string }, origin: string) =>
	absolute(`/rezept/${recipe.id}/${slugerize(recipe.title)}`, origin);

export const profileUrl = (username: string, origin: string) => absolute(`/@${username}`, origin);

/** Schema.org data of a recipe, which search engines show as rich result */
export const recipeJsonLd = (
	recipe: Recipe,
	{ origin, canonical }: { origin: string; canonical: string }
) => {
	const images = recipe.image
		? [...recipe.image.variants.webp, ...recipe.image.variants.avif.slice(-1)].map(({ url }) =>
				absolute(url, origin)
			)
		: [];
	const original = recipe.attribution[0];
	const steps: object[] = [];
	for (const step of recipe.steps) {
		if (isSection(step))
			steps.push({ '@type': 'HowToSection', name: step.section, itemListElement: [] });
		else {
			const howTo = { '@type': 'HowToStep', text: step.description };
			const section = steps.at(-1) as { '@type': string; itemListElement: object[] } | undefined;
			if (section?.['@type'] === 'HowToSection') section.itemListElement.push(howTo);
			else steps.push(howTo);
		}
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'Recipe',
		'@id': canonical,
		name: recipe.title,
		...(recipe.description && { description: recipe.description }),
		...(images.length && { image: images }),
		...(recipe.author && {
			author: {
				'@type': 'Person',
				name: recipe.author.name,
				url: profileUrl(recipe.author.username, origin)
			}
		}),
		dateModified: new Date(recipe.updatedAt).toISOString(),
		recipeYield: `${recipe.meta.portion} Portionen`,
		totalTime: `PT${recipe.meta.duration}M`,
		recipeCategory: recipe.meta.category.name,
		...(DIETS[recipe.meta.nutritionType] && { suitableForDiet: DIETS[recipe.meta.nutritionType] }),
		keywords: [recipe.meta.category.name, recipe.meta.nutritionType].join(', '),
		recipeIngredient: recipe.ingredients
			.filter((item): item is Ingredient => !isSection(item))
			.map(ingredientText),
		recipeInstructions: steps,
		inLanguage: 'de',
		license: LICENSE_URL,
		...(original?.exists
			? { isBasedOn: recipeUrl({ id: original.recipeId, title: original.title }, origin) }
			: recipe.sourceUrl
				? { isBasedOn: recipe.sourceUrl }
				: {}),
		mainEntityOfPage: canonical,
		publisher: { '@type': 'Organization', name: SITE_NAME, url: absolute('/', origin) }
	};
};

/** A recipe as Markdown, for AI assistants and other programs that read the site */
export const recipeMarkdown = (recipe: Recipe, origin: string) => {
	const lines = [`# ${recipe.title}`, ''];
	if (recipe.description) lines.push(recipe.description, '');
	lines.push(
		`- Portionen: ${recipe.meta.portion}`,
		`- Dauer: ${recipe.meta.duration} Minuten`,
		`- Kategorie: ${recipe.meta.category.name}`,
		`- Ernährung: ${recipe.meta.nutritionType}`,
		'',
		'## Zutaten',
		''
	);
	for (const item of recipe.ingredients) {
		lines.push(isSection(item) ? `\n### ${item.section}\n` : `- ${ingredientText(item)}`);
	}
	lines.push('', '## Zubereitung', '');
	let number = 0;
	for (const step of recipe.steps) {
		if (isSection(step)) {
			lines.push('', `### ${step.section}`, '');
			number = 0;
		} else lines.push(`${++number}. ${step.description}`);
	}
	lines.push(
		'',
		'---',
		'',
		`Rezept: ${recipeUrl(recipe, origin)}`,
		...(recipe.author
			? [`Von: ${recipe.author.name} (${profileUrl(recipe.author.username, origin)})`]
			: []),
		...(recipe.sourceUrl ? [`Quelle: ${recipe.sourceUrl}`] : []),
		`Lizenz: CC BY-SA 4.0 (${LICENSE_URL}), veröffentlicht auf ${SITE_NAME}`,
		''
	);
	return lines.join('\n').replace(/\n{3,}/g, '\n\n');
};

/** `<script type="application/ld+json">` for the page head, safe against `</script>` in texts */
export const jsonLdScript = (data: object) =>
	`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
