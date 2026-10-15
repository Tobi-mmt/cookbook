<script lang="ts">
	import type { RecipeSummary } from '#types';
	import { page } from '$app/state';
	import Avatar from '#components/Avatar.svelte';
	import QrCodeButton from '#components/QrCodeButton.svelte';
	import AddRecipeButton from '#components/AddRecipeButton.svelte';
	import RecipeBrowser from '#components/RecipeBrowser.svelte';
	import ReportDialog from '#components/ReportDialog.svelte';
	import { me } from '#lib/me.svelte.js';
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
	const chips = $derived(
		data.cookbooks.map((cookbook) => ({ ...cookbook, href: cookbookPath(cookbook) }))
	);
	const ownCookbook = $derived(
		me.current?.user?.username === profile.username
			? me.current.cookbooks.find(({ role }) => role === 'owner')
			: undefined
	);
	const profileUrl = $derived(new URL(profilePath(profile.username), page.url.origin).href);
</script>

<svelte:head>
	<title>{profile.name} (@{profile.username}) - {SITE_NAME}</title>
	<meta name="description" content="Die Rezepte von {profile.name} auf {SITE_NAME}." />
	<meta property="og:title" content="Die Rezepte von {profile.name}" />
	{#if data.noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>

<header class="profile">
	<Avatar name={profile.name} size="4rem" />
	<h1>{profile.name}</h1>
	<p class="handle">@{profile.username}</p>
	<QrCodeButton url={profileUrl} label="QR-Code für das Profil von {profile.name}" />
</header>

<RecipeBrowser
	recipes={data.recipes}
	cookbooks={chips}
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
		gap: 0.5rem;
		padding: 2.5rem 1.5rem 0.5rem;
		text-align: center;
	}
	h1 {
		margin: 0.5rem 0 0;
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.handle {
		margin: 0 0 0.5rem;
		color: var(--color-text-subtle);
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
