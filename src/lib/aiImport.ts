import type { Category } from '../types';
import { NUTRITION_TYPES, recipeInputSchema, type RecipeInput } from './recipeInput';

/** The request people give to an AI of their choice together with a screenshot, link or text */
export const aiPrompt = (
	categories: Pick<Category, 'name'>[]
) => `Du hilfst mir, ein Rezept für mein digitales Kochbuch zu erfassen. Ich gebe dir dazu einen Screenshot, einen Link oder einen Text.

Antworte ausschließlich mit einem JSON-Objekt in genau diesem Format, ohne Erklärung davor oder danach:

{
  "title": "Name des Rezepts",
  "description": "ein bis zwei Sätze oder null",
  "sourceUrl": "der Link, falls ich einen angegeben habe, sonst null",
  "portion": 4,
  "duration": 30,
  "category": "${categories.map(({ name }) => name).join(' | ')}",
  "nutritionType": "${NUTRITION_TYPES.join(' | ')}",
  "ingredients": [
    { "quantity": 200, "unit": "g", "name": "Mehl" },
    { "section": "Für die Soße" },
    { "quantity": null, "unit": null, "name": "Salz" }
  ],
  "steps": [
    { "text": "Mehl und Zucker verrühren.", "ingredients": ["Mehl", "Zucker"] },
    { "section": "Soße" },
    { "text": "Mit Salz abschmecken.", "ingredients": ["Salz"] }
  ]
}

Regeln:
- Übernimm nur Zutaten und Schritte, die wirklich im Material stehen. Erfinde nichts dazu.
- Formuliere die Schritte in eigenen Worten, kurz und klar.
- Gib bei jedem Schritt unter "ingredients" die Zutaten an, die in diesem Schritt dazukommen, genau so geschrieben wie bei "name" in der Zutatenliste. Jede Zutat gehört zu genau einem Schritt, und zwar zu dem, in dem sie zum ersten Mal verarbeitet wird.
- "quantity" ist eine Zahl (0.5 statt ½) oder null. Einheiten kurz: g, kg, ml, l, EL, TL, Prise, Stück.
- "portion" ist die Zahl der Portionen, "duration" die gesamte Zeit in Minuten. Schätze sinnvoll, wenn nichts angegeben ist.
- "category" und "nutritionType" sind genau einer der angegebenen Werte.
- Antworte auf Deutsch.

Hier ist das Rezept:
`;

type AiIngredient = { section?: unknown; quantity?: unknown; unit?: unknown; name?: unknown };
type AiStep = string | { section?: unknown; text?: unknown; ingredients?: unknown };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const number = (value: unknown) => {
	const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
	return typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/** The JSON object of an answer, also inside a code block or between other text */
const extractJson = (answer: string) => {
	const start = answer.indexOf('{');
	const end = answer.lastIndexOf('}');
	if (start === -1 || end <= start) return null;
	try {
		return JSON.parse(answer.slice(start, end + 1)) as Record<string, unknown>;
	} catch {
		return null;
	}
};

const find = <T extends { name: string }>(items: readonly T[], value: unknown) => {
	const wanted = text(value).toLowerCase();
	return (
		items.find(({ name }) => name.toLowerCase() === wanted) ??
		items.find(
			({ name }) =>
				wanted && (name.toLowerCase().includes(wanted) || wanted.includes(name.toLowerCase()))
		)
	);
};

/** Turns the answer of the AI into editor input, or says what is wrong with it */
export const parseAiAnswer = (
	answer: string,
	categories: Pick<Category, 'id' | 'name'>[]
): { input: RecipeInput } | { error: string } => {
	const json = extractJson(answer);
	if (!json) {
		return {
			error:
				'In der Antwort steht kein Rezept im erwarteten Format. Kopiere bitte die komplette Antwort der KI.'
		};
	}

	const ingredients = (Array.isArray(json.ingredients) ? (json.ingredients as AiIngredient[]) : [])
		.map((item, index) =>
			text(item?.section)
				? { clientId: `ai-${index}`, kind: 'section' as const, name: text(item.section) }
				: {
						clientId: `ai-${index}`,
						kind: 'ingredient' as const,
						name: text(item?.name),
						quantity: number(item?.quantity),
						unit: text(item?.unit) || null
					}
		)
		.filter(({ name }) => name);
	const usable = ingredients.filter(({ kind }) => kind === 'ingredient');
	const linked = new Set<string>();
	const linksOf = (names: unknown) => {
		const ids = (Array.isArray(names) ? names : []).flatMap((name) => {
			const wanted = text(name).toLowerCase();
			const match =
				usable.find((ingredient) => ingredient.name.toLowerCase() === wanted) ??
				(wanted.length >= 4 ? find(usable, wanted) : undefined);
			return match?.clientId ?? [];
		});
		const fresh = [...new Set(ids)].filter((id) => !linked.has(id));
		for (const id of fresh) linked.add(id);
		return fresh.map((ingredientId) => ({ ingredientId, quantity: null }));
	};
	const steps = (Array.isArray(json.steps) ? (json.steps as AiStep[]) : [])
		.map((step) =>
			typeof step === 'string'
				? { kind: 'step' as const, text: step.trim(), links: [] }
				: text(step?.section)
					? { kind: 'section' as const, text: text(step.section), links: [] }
					: { kind: 'step' as const, text: text(step?.text), links: linksOf(step?.ingredients) }
		)
		.filter(({ text }) => text);

	const nutritionType =
		NUTRITION_TYPES.find((type) => type.toLowerCase() === text(json.nutritionType).toLowerCase()) ??
		'Vegetarisch';
	const parsed = recipeInputSchema.safeParse({
		title: text(json.title),
		description: text(json.description) || null,
		sourceUrl: /^https?:\/\//.test(text(json.sourceUrl)) ? text(json.sourceUrl) : null,
		portion: Math.round(number(json.portion) ?? 4),
		duration: Math.round(number(json.duration) ?? 30),
		categoryId: (find(categories, json.category) ?? categories[0])?.id,
		nutritionType,
		ingredients,
		steps
	});
	return parsed.success
		? { input: parsed.data }
		: { error: [...new Set(parsed.error.issues.map(({ message }) => message))].join(', ') };
};
