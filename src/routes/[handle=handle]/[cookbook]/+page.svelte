<script lang="ts">
	import type { RecipeSummary } from '#types';
	import RecipeBrowser from '#components/RecipeBrowser.svelte';
	import { profilePath } from '#lib/paths.js';
	import type { CookbookWithMembers } from '#lib/server/profiles.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: { cookbook: CookbookWithMembers; recipes: RecipeSummary[]; noindex: boolean };
	} = $props();

	const { cookbook } = $derived(data);
	const shared = $derived(cookbook.members.length > 1);
</script>

<svelte:head>
	<title>{cookbook.name} von @{cookbook.ownerUsername} - {SITE_NAME}</title>
	<meta
		name="description"
		content="{data.recipes
			.length} Rezepte im Kochbuch „{cookbook.name}“ von @{cookbook.ownerUsername}."
	/>
	<meta property="og:title" content={cookbook.name} />
	{#if data.noindex || !data.recipes.length}<meta name="robots" content="noindex" />{/if}
</svelte:head>

<header class="cookbook">
	<h1>{cookbook.name}</h1>
	<p class="members">
		{#each cookbook.members as member, index (member.username)}
			{#if index > 0}{index === cookbook.members.length - 1 ? ' und ' : ', '}{/if}
			<a href={profilePath(member.username)}>{member.name}</a>
		{/each}
	</p>
</header>

<RecipeBrowser
	recipes={data.recipes}
	byline={(recipe) => (shared && recipe.author ? `von ${recipe.author.name}` : null)}
>
	{#snippet empty()}
		<p class="empty">Noch keine Rezepte.</p>
	{/snippet}
</RecipeBrowser>

<style>
	.cookbook {
		padding: 2.5rem 1.5rem 0.5rem;
		text-align: center;
	}
	h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.members {
		margin: 0.5rem 0 0;
		color: var(--color-text-subtle);
	}
	.members a {
		color: inherit;
	}
	.empty {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--color-text-muted);
	}
</style>
