<script lang="ts">
	import type { RecipeSummary } from '#types';
	import AddRecipeButton from '#components/AddRecipeButton.svelte';
	import Settings from '@lucide/svelte/icons/settings';
	import RecipeBrowser from '#components/RecipeBrowser.svelte';
	import ReportDialog from '#components/ReportDialog.svelte';
	import { me } from '#lib/me.svelte.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
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
	<div class="title">
		<h1>{cookbook.name}</h1>
		{#if me.canEdit(cookbook.id)}
			<a
				class="settings"
				href="{page.url.pathname}/einstellungen"
				aria-label="Einstellungen des Kochbuchs"
				title="Einstellungen"><Settings size="1.25rem" aria-hidden="true" /></a
			>
		{/if}
	</div>
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
		{#if me.canEdit(cookbook.id)}
			<div class="empty">
				<p>Dein Kochbuch ist noch leer.</p>
				<div class="row">
					<a class="btn btn--primary" href="{resolve('/neu')}?kochbuch={cookbook.id}"
						>Rezept anlegen</a
					>
					<a class="btn" href="{resolve('/import')}?kochbuch={cookbook.id}">Aus Link importieren</a>
					<a class="btn" href={resolve('/')}>Rezepte entdecken</a>
				</div>
			</div>
		{:else}
			<p class="empty">Noch keine Rezepte.</p>
		{/if}
	{/snippet}
</RecipeBrowser>

<p class="report"><ReportDialog targets={[{ type: 'cookbook', id: cookbook.id }]} /></p>

{#if me.canEdit(cookbook.id)}
	<AddRecipeButton cookbookId={cookbook.id} />
{/if}

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
	.report {
		margin: 2rem 0;
		text-align: center;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.settings {
		display: flex;
		padding: 0.4rem;
		color: var(--color-text-subtle);
		border-radius: var(--radius-pill);
	}
	.settings:hover {
		color: var(--color-text);
		background: var(--color-surface-muted);
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
	.empty .row {
		justify-content: center;
	}
</style>
