<script context="module">
	import { recipes } from '$lib/recipes';

	export async function load(context) {
		const { recipeSlug } = context.params;
		const recipeId = recipeSlug.split('/')[0];
		const foundRecipe = recipes.find((recipe) => {
			return recipe.id === recipeId;
		});

		return { props: { recipe: foundRecipe } };
	}
</script>

<script lang="ts">
	import type { Recipe } from 'src/types';
	import RecipeComponent from '../../components/Recipe.svelte';

	export let recipe: Recipe;
</script>

<svelte:head>
	<title>Tobi's Kochbuch</title>
	<meta
		name="description"
		content="Meine Liebelingsrezepte, die ich über die Jahre angesammelt habe."
	/>
	<meta name="author" content="Tobias" />
</svelte:head>

{#if recipe}
	{#key recipe}
		<RecipeComponent {recipe} />
	{/key}
{:else}
	<h1>Kein Rezept gefunden</h1>
	<p>Gehe zur <a href="/">Übersicht</a> oder benutze die Suche, um ein Rezept zu finden.</p>
{/if}
