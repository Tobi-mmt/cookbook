<script lang="ts">
	import type { Category } from '#types';
	import { resolve } from '$app/paths';
	import RecipeEditor from '#components/editor/RecipeEditor.svelte';
	import type { RecipeInput } from '#lib/recipeInput.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			recipe: RecipeInput;
			categories: Category[];
			cookbookId: string;
			cookbooks: { id: string; name: string }[];
		};
		form: { error?: string } | null;
	} = $props();
</script>

<svelte:head>
	<title>Neues Rezept - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Neues Rezept</h1>
	<RecipeEditor
		recipe={data.recipe}
		image={null}
		categories={data.categories}
		cookbooks={data.cookbooks}
		cookbookId={data.cookbookId}
		cancelHref={resolve('/')}
		error={form?.error}
	/>
</div>
