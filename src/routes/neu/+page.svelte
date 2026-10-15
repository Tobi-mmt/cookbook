<script lang="ts">
	import type { Category } from '#types';
	import { page } from '$app/state';
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
			cancelHref: string;
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
		cancelHref={data.cancelHref}
		draftKey={page.url.searchParams.get('entwurf') ?? 'new'}
		result={form}
	/>
</div>
