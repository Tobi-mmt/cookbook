<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { resolve } from '$app/paths';
	import type { LandingKind } from '#lib/landings.js';
	import { recipePath } from '#lib/paths.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		kind,
		title,
		name,
		recipes
	}: { kind: LandingKind; title: string; name: string; recipes: RecipeSummary[] } = $props();

	const subject = $derived(
		kind === 'ingredient'
			? `Rezepte mit ${name}`
			: kind === 'diet'
				? title.charAt(0).toLowerCase() + title.slice(1)
				: `Rezepte aus der Kategorie ${name}`
	);
	const heading = $derived(
		kind === 'ingredient'
			? `Rezepte mit ${name}: Ideen aus echten Familienkochbüchern`
			: kind === 'diet'
				? `${title} für jeden Tag`
				: `${name}: Rezepte zum Nachkochen und Sammeln`
	);
	const quick = $derived(recipes.filter(({ meta }) => meta.duration <= 30));
	const fastest = $derived(
		recipes.reduce<RecipeSummary | null>(
			(best, recipe) => (!best || recipe.meta.duration < best.meta.duration ? recipe : best),
			null
		)
	);
	const average = $derived(
		Math.round(recipes.reduce((sum, { meta }) => sum + meta.duration, 0) / (recipes.length || 1))
	);
	const vegan = $derived(recipes.filter(({ meta }) => meta.nutritionType === 'Vegan').length);
	const vegetarian = $derived(
		recipes.filter(({ meta }) => meta.nutritionType === 'Vegetarisch').length
	);
	const categories = $derived(
		[
			...recipes
				.reduce(
					(counts, { meta }) =>
						counts.set(meta.category.name, (counts.get(meta.category.name) ?? 0) + 1),
					new Map<string, number>()
				)
				.entries()
		]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([category]) => category)
	);
	const examples = $derived(recipes.slice(0, 3));
	const list = (items: string[]) =>
		items.length > 1 ? `${items.slice(0, -1).join(', ')} und ${items.at(-1)}` : (items[0] ?? '');
	const dietText = $derived.by(() => {
		const parts = [
			vegan ? `${vegan} vegan` : '',
			vegetarian ? `${vegetarian} vegetarisch` : ''
		].filter(Boolean);
		return parts.length
			? `Davon ${vegan + vegetarian === 1 ? 'ist' : 'sind'} ${list(parts)}.`
			: null;
	});
</script>

<section class="text">
	<h2>{heading}</h2>
	<p>
		Du suchst {subject}, die wirklich jemand kocht? Hier findest du {recipes.length}
		{recipes.length === 1 ? 'Rezept' : 'Rezepte'}, die Menschen in ihren eigenen Kochbüchern bei der
		{SITE_NAME} sammeln: erprobte Alltagsküche statt endloser Werbetexte, mit klaren Zutatenlisten und
		Schritten.
	</p>
	{#if fastest}
		<p>
			{#if quick.length}
				Wenn es schnell gehen muss: {quick.length}
				{quick.length === 1 ? 'Rezept ist' : 'Rezepte sind'} in höchstens 30 Minuten fertig, am schnellsten
				<a href={recipePath(fastest)}>{fastest.title}</a> mit {fastest.meta.duration} Minuten.
			{:else}
				Im Schnitt brauchst du für diese Rezepte {average} Minuten, am schnellsten geht
				<a href={recipePath(fastest)}>{fastest.title}</a> mit {fastest.meta.duration} Minuten.
			{/if}
			{#if kind !== 'diet' && dietText}{dietText}{/if}
		</p>
	{/if}
	{#if examples.length}
		<p>
			Zum Beispiel:
			{#each examples as recipe, index (recipe.id)}{#if index > 0}{index === examples.length - 1
						? ' und '
						: ', '}{/if}<a href={recipePath(recipe)}>{recipe.title}</a>{/each}.
			{#if kind !== 'category' && categories.length}
				Die meisten gehören {categories.length === 1
					? `zur Kategorie ${categories[0]}`
					: `zu den Kategorien ${list(categories)}`}.
			{/if}
		</p>
	{/if}

	<h2>Dein eigenes Kochbuch, gemeinsam mit anderen</h2>
	<p>
		Jedes Rezept rechnest du auf deine Portionen um, schickst die Zutaten mit einem Klick an Bring!
		und übernimmst es mit „In mein Kochbuch“ in deine eigene Sammlung. Mit einem kostenlosen Konto
		legst du eigene Kochbücher an, importierst Rezepte aus Links und lädst Familie und Freunde ein,
		gemeinsam daran zu arbeiten. So entsteht nach und nach euer Familienkochbuch, ohne
		Zettelwirtschaft, ohne Werbung und ohne Abo.
	</p>
	<p>
		<a href={resolve('/anmelden')}>Kostenlos ein Kochbuch anlegen</a> ·
		<a href={resolve('/ueber')}>Mehr über die {SITE_NAME}</a>
	</p>
</section>

<style>
	.text {
		max-width: 46rem;
		margin: 3rem auto 0;
		padding: 0 1.5rem;
	}
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.25rem;
		font-weight: 400;
	}
	h2:first-child {
		margin-top: 0;
	}
	p {
		margin: 0 0 0.85rem;
		line-height: 1.65;
		color: var(--color-text-muted);
	}
	a {
		color: var(--color-text);
	}
	@media (max-width: 599px) {
		.text {
			padding: 0 1rem;
		}
	}
</style>
