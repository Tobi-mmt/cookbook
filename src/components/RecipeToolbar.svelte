<script lang="ts">
	import type { Recipe } from '#types';
	import BookPlus from '@lucide/svelte/icons/book-plus';
	import FolderInput from '@lucide/svelte/icons/folder-input';
	import History from '@lucide/svelte/icons/history';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { me } from '#lib/me.svelte.js';
	import { slugerize } from '#lib/slugerize.js';

	let { recipe }: { recipe: Recipe } = $props();

	let notice = $state<string | null>(null);
	let copiedTo = $state<string | null>(null);
	let choosing = $state<'copy' | 'move' | null>(null);
	let busy = $state(false);

	const editPath = $derived(
		resolve('/rezept/[id]/[titel]/bearbeiten', { id: recipe.id, titel: slugerize(recipe.title) })
	);
	const user = $derived(me.current?.user);
	const cookbooks = $derived(me.current?.cookbooks ?? []);
	const canEdit = $derived(me.canEdit(recipe.cookbook.id) || user?.role === 'admin');
	const moveTargets = $derived(cookbooks.filter(({ id }) => id !== recipe.cookbook.id));

	onMount(() => {
		if (page.url.searchParams.has('gespeichert')) notice = 'Gespeichert.';
		copiedTo = page.url.searchParams.get('kopiert');
	});

	const share = async () => {
		const url = page.url.origin + page.url.pathname;
		if (navigator.share) {
			await navigator.share({ title: recipe.title, url }).catch(() => {});
			return;
		}
		await navigator.clipboard.writeText(url);
		notice = 'Link kopiert.';
	};

	const post = (action: 'kopieren' | 'verschieben', cookbookId: string) =>
		fetch(`/api/rezept/${recipe.id}/${action}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ cookbookId })
		});

	const copyTo = async (cookbook: { id: string; name: string }) => {
		busy = true;
		const response = await post('kopieren', cookbook.id);
		busy = false;
		choosing = null;
		if (!response.ok) {
			const message = (await response.json().catch(() => null))?.message;
			notice = message ?? 'Das Rezept konnte nicht übernommen werden.';
			return;
		}
		const { url } = await response.json();
		await goto(`${url}?kopiert=${encodeURIComponent(cookbook.name)}`);
	};

	const moveTo = async (cookbook: { id: string; name: string }) => {
		busy = true;
		const response = await post('verschieben', cookbook.id);
		busy = false;
		choosing = null;
		notice = response.ok
			? `Verschoben nach „${cookbook.name}“.`
			: 'Das Rezept konnte nicht verschoben werden.';
		if (response.ok) await goto(page.url.pathname, { invalidateAll: true, replace: true });
	};

	const startCopy = () => {
		if (cookbooks.length === 1) copyTo(cookbooks[0]);
		else choosing = 'copy';
	};
</script>

<div class="toolbar">
	{#if copiedTo}
		<p class="notice" role="status">
			Kopie in „{copiedTo}“ angelegt. <a href={editPath}>Jetzt anpassen</a>
		</p>
	{:else if notice}
		<p class="notice" role="status">{notice}</p>
	{/if}
	<div class="row actions">
		<button type="button" class="btn" onclick={share}>
			<Share2 size="1em" aria-hidden="true" /> Teilen
		</button>
		{#if user}
			<button type="button" class="btn" disabled={busy} onclick={startCopy}>
				<BookPlus size="1em" aria-hidden="true" /> In mein Kochbuch
			</button>
		{:else if me.current}
			<a class="btn" href="{resolve('/anmelden')}?weiter={encodeURIComponent(page.url.pathname)}">
				<BookPlus size="1em" aria-hidden="true" /> In mein Kochbuch
			</a>
		{/if}
		{#if canEdit}
			<a class="btn" href={editPath}><Pencil size="1em" aria-hidden="true" /> Bearbeiten</a>
			<a
				class="btn"
				href={resolve('/rezept/[id]/[titel]/verlauf', {
					id: recipe.id,
					titel: slugerize(recipe.title)
				})}><History size="1em" aria-hidden="true" /> Verlauf</a
			>
			{#if moveTargets.length}
				<button type="button" class="btn" disabled={busy} onclick={() => (choosing = 'move')}>
					<FolderInput size="1em" aria-hidden="true" /> Verschieben nach …
				</button>
			{/if}
		{/if}
	</div>
	{#if choosing}
		<div class="choose" role="group" aria-label="Kochbuch wählen">
			<span class="hint">{choosing === 'copy' ? 'In welches Kochbuch?' : 'Wohin verschieben?'}</span
			>
			{#each choosing === 'copy' ? cookbooks : moveTargets as cookbook (cookbook.id)}
				<button
					type="button"
					class="btn"
					disabled={busy}
					onclick={() => (choosing === 'copy' ? copyTo(cookbook) : moveTo(cookbook))}
					>{cookbook.name}</button
				>
			{/each}
			<button type="button" class="btn btn--quiet" onclick={() => (choosing = null)}
				>Abbrechen</button
			>
		</div>
	{/if}
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}
	.notice {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}
	.notice a {
		color: var(--color-text);
	}
	.actions {
		margin-left: auto;
	}
	.choose {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		width: 100%;
	}
</style>
