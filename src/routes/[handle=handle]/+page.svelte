<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { page } from '$app/state';
	import QrCodeButton from '#components/QrCodeButton.svelte';
	import AddRecipeButton from '#components/AddRecipeButton.svelte';
	import RecipeBrowser from '#components/RecipeBrowser.svelte';
	import ReportDialog from '#components/ReportDialog.svelte';
	import { me } from '#lib/me.svelte.js';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Plus from '@lucide/svelte/icons/plus';
	import NewCookbookDialog from '#components/NewCookbookDialog.svelte';
	import { cookbookPath, profilePath } from '#lib/paths.js';
	import type { CookbookWithMembers } from '#lib/server/profiles.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			profile: { id: string; username: string; name: string };
			cookbooks: (CookbookWithMembers & { hint?: string })[];
			recipes: RecipeSummary[];
			noindex: boolean;
		};
	} = $props();

	const { profile } = $derived(data);
	const recipeCount = (cookbookId: string) =>
		data.recipes.filter((recipe) => recipe.cookbookId === cookbookId).length;
	const ownCookbook = $derived(
		me.current?.user?.username === profile.username
			? me.current.cookbooks.find(({ role }) => role === 'owner')
			: undefined
	);
	const isOwnProfile = $derived(me.current?.user?.username === profile.username);
	let creating = $state(false);
	const profileUrl = $derived(new URL(profilePath(profile.username), page.url.origin).href);
</script>

<svelte:head>
	<title>{profile.name} (@{profile.username}) - {SITE_NAME}</title>
	<meta name="description" content="Die Rezepte von {profile.name} auf {SITE_NAME}." />
	<meta property="og:title" content="Die Rezepte von {profile.name}" />
	{#if data.noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>

<!-- like the head of a cookbook: the name, below it quietly who and how much -->
<header class="profile">
	<h1>{profile.name}</h1>
	<p class="handle">
		@{profile.username} · {data.recipes.length}
		{data.recipes.length === 1 ? 'Rezept' : 'Rezepte'}
		<QrCodeButton compact url={profileUrl} label="QR-Code für das Profil von {profile.name}" />
	</p>
</header>

<!-- the cookbooks are places of their own, a click leads there -->
{#if data.cookbooks.length || isOwnProfile}
	<nav class="cookbooks" aria-label="Kochbücher von {profile.name}">
		{#each data.cookbooks as cookbook (cookbook.id)}
			<a class="cookbook" href={cookbookPath(cookbook)}>
				<BookOpen size="1.1em" aria-hidden="true" />
				<span>
					<span class="cookbook-name">{cookbook.name}</span>
					<span class="cookbook-meta">
						{recipeCount(cookbook.id)}
						{recipeCount(cookbook.id) === 1 ? 'Rezept' : 'Rezepte'}{cookbook.hint
							? ` · ${cookbook.hint}`
							: ''}
					</span>
				</span>
			</a>
		{/each}
		{#if isOwnProfile}
			<button
				type="button"
				class="cookbook cookbook--new"
				aria-label="Neues Kochbuch"
				title="Neues Kochbuch"
				onclick={() => (creating = true)}
			>
				<Plus size="1.1em" aria-hidden="true" />
			</button>
		{/if}
	</nav>
	<NewCookbookDialog bind:open={creating} />
{/if}

<RecipeBrowser
	recipes={data.recipes}
	searchPlaceholder="In den Rezepten von {profile.name} suchen"
	byline={(recipe) =>
		recipe.author && recipe.author.username !== profile.username
			? `von ${recipe.author.name}`
			: null}
>
	{#snippet empty()}
		<p class="empty">{profile.name} hat noch keine Rezepte.</p>
	{/snippet}
</RecipeBrowser>

<p class="report"><ReportDialog targets={[{ type: 'user', id: profile.id }]} /></p>

{#if ownCookbook}
	<AddRecipeButton cookbookId={ownCookbook.id} />
{/if}

<style>
	.profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 2.5rem 1.5rem 0.5rem;
		text-align: center;
	}
	h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.handle {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		color: var(--color-text-subtle);
	}
	.cookbooks {
		display: flex;
		justify-content: safe center;
		gap: 0.75rem;
		padding: 1.25rem 1.5rem 0;
		/* one row that scrolls sideways when there are many */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.cookbooks::-webkit-scrollbar {
		display: none;
	}
	.cookbook {
		flex: none;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 1rem 0.55rem 0.85rem;
		color: var(--color-text);
		text-decoration: none;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color 0.15s;
	}
	.cookbook--new {
		justify-content: center;
		min-width: 3rem;
		padding: 0.55rem 0.85rem;
		font: inherit;
		color: var(--color-text-subtle);
		border-style: dashed;
		cursor: pointer;
	}
	.cookbook:hover {
		border-color: var(--color-text-subtle);
	}
	.cookbook :global(svg) {
		flex: none;
		color: var(--color-text-subtle);
	}
	.cookbook-name {
		display: block;
		font-size: 0.9375rem;
	}
	.cookbook-meta {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}
	@media (max-width: 599px) {
		.cookbooks {
			justify-content: flex-start;
			padding: 1rem 1rem 0;
		}
	}
	.report {
		margin: 2rem 0;
		text-align: center;
	}
	.empty {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--color-text-muted);
	}
</style>
