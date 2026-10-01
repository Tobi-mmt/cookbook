import type { Category, NutritionType } from '../../../types';
import type { IngredientInput, RecipeInput, StepInput } from '../../recipeInput';
import type { ScrapedRecipe } from './extract';
import { parseIngredient } from './parseIngredient';

const DEFAULT_PORTION = 2;
const DEFAULT_DURATION = 30;

const MEAT =
	/fleisch|schwein|rind|kalb|lamm|hähnchen|huhn|hühn|geflügel|pute|(?<!\p{L})ente|speck|schinken|salami|wurst|würst|(?<!\p{L})hack|bacon|pancetta|guanciale|chorizo|fisch|lachs|thunfisch|forelle|kabeljau|sardell|garnele|shrimp|scampi|muschel/iu;

export const parseDuration = (value: string | undefined): number | undefined => {
	if (!value) return undefined;
	const iso = value.match(
		/^P(?:(\d+)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i
	);
	const [days, hours, minutes] = iso
		? iso.slice(1, 4).map(Number)
		: [
				0,
				Number(value.match(/(\d+)\s*(?:h|std|stunde)/i)?.[1] ?? 0),
				Number(value.match(/(\d+)\s*min/i)?.[1] ?? 0)
			];
	const total = Math.round((days || 0) * 1440 + (hours || 0) * 60 + (minutes || 0));
	return total > 0 ? total : undefined;
};

const parsePortion = (value: string | undefined) => {
	const portion = Number(value?.match(/\d+/)?.[0]);
	return portion > 0 ? portion : DEFAULT_PORTION;
};

const toCategory = (haystack: string): Category => {
	if (/getränk|drink|cocktail|smoothie|punsch|bowle|limonade|likör|shake/i.test(haystack))
		return 'Getränke';
	if (/salat/i.test(haystack)) return 'Salat';
	if (
		/dessert|nachtisch|nachspeise|kuchen|torte|gebäck|keks|plätzchen|(?<!\p{L})süß(?!kartoffel)|muffin|brownie/iu.test(
			haystack
		)
	)
		return 'Süßspeise';
	return 'Herzhaft';
};

const toNutritionType = (recipe: ScrapedRecipe, ingredientNames: string[]): NutritionType => {
	const tags = [...recipe.diets, ...recipe.keywords, ...recipe.categories].join(' ');
	if (/vegan/i.test(tags)) return 'Vegan';
	if (/vegetari/i.test(tags)) return 'Vegetarisch';
	if (MEAT.test([tags, ...ingredientNames].join(' '))) return 'Fleisch';
	return 'Vegetarisch';
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** German nouns are capitalized, so they identify an ingredient best */
const ingredientWords = (name: string) => {
	const words = name
		.replace(/\([^)]*\)/g, ' ')
		.split(',')[0]
		.split(/[\s/]+/)
		.filter((word) => word.length >= 2);
	const nouns = words.filter((word) => /^\p{Lu}/u.test(word));
	return (nouns.length ? nouns : words).map((word) => word.toLowerCase());
};

const wordPattern = (word: string) => {
	const stem = word.length > 4 ? word.replace(/(en|er|e|n|s)$/, '') : word;
	const suffix = stem.length >= 5 ? '\\p{L}{0,4}' : '(?:e|en|er|ern|n|s|es)?';
	return new RegExp(`(?<!\\p{L})${escapeRegExp(stem)}${suffix}(?!\\p{L})`, 'iu');
};

/** "Laugenbrezeln" contains "Brezeln", "BBQ-Sauce" does not stand for any "Sauce" */
const isCompoundOf = (word: string, part: string) =>
	word.length > part.length &&
	word.endsWith(part) &&
	/\p{L}/u.test(word[word.length - part.length - 1]);

const mentions = (text: string, name: string) => {
	const words = ingredientWords(name);
	const textWords = text.toLowerCase().match(/\p{L}{4,}/gu) ?? [];
	return (
		words.some((word) => wordPattern(word).test(text)) ||
		words.some((word) => textWords.some((textWord) => isCompoundOf(word, textWord)))
	);
};

const linkIngredients = (text: string, ingredients: IngredientInput[]) =>
	ingredients
		.filter((ingredient) => mentions(text, ingredient.name))
		.map((ingredient) => ({ ingredientId: ingredient.clientId }));

export const toRecipeInput = (recipe: ScrapedRecipe, sourceUrl: string): RecipeInput => {
	const ingredients: IngredientInput[] = recipe.ingredients.map((text, index) => ({
		clientId: `import-${index}`,
		kind: 'ingredient',
		...parseIngredient(text)
	}));

	const toStep = (text: string): StepInput => ({
		kind: 'step',
		text,
		links: linkIngredients(text, ingredients)
	});
	const sections = recipe.instructions.filter((item) => typeof item !== 'string');
	const flatten = recipe.instructions.length === 1 && sections.length === 1;
	const steps = recipe.instructions.flatMap((item): StepInput[] =>
		typeof item === 'string'
			? [toStep(item)]
			: [
					...(flatten
						? []
						: [{ kind: 'section' as const, text: item.section || 'Zubereitung', links: [] }]),
					...item.steps.map(toStep)
				]
	);

	return {
		title: recipe.name?.replace(/\s+Rezept$/i, '') || 'Importiertes Rezept',
		description: recipe.description ?? null,
		sourceUrl,
		portion: parsePortion(recipe.yield),
		duration:
			parseDuration(recipe.totalTime) ??
			((parseDuration(recipe.prepTime) ?? 0) + (parseDuration(recipe.cookTime) ?? 0) ||
				DEFAULT_DURATION),
		category: toCategory([...recipe.categories, ...recipe.keywords, recipe.name].join(' ')),
		nutritionType: toNutritionType(
			recipe,
			ingredients.map(({ name }) => name)
		),
		ingredients,
		steps: steps.some((step) => step.kind === 'step')
			? steps
			: [...steps, { kind: 'step', text: 'Zubereitung ergänzen', links: [] }]
	};
};
