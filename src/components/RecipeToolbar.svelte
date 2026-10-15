<script lang="ts">
	import type { Recipe } from '#types';
	import BookCheck from '@lucide/svelte/icons/book-check';
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

	type Copy = { url: string; cookbookId: string; cookbookName: string };
	let copies = $state<Copy[]>([]);
	/** cookbooks that do not have this recipe yet */
	const copyTargets = $derived(
		cookbooks.filter(({ id }) => !copies.some((copy) => copy.cookbookId === id))
	);

	$effect(() => {
		if (!user || canEdit) return;
		fetch(`/api/rezept/${recipe.id}/kopien`)
			.then((response) => response.json())
			.then((list: Copy[]) => (copies = list))
			.catch(console.error);
	});

	onMount(() => {
		if (page.url.searchParams.has('gespeichert')) notice = 'Gespeichert.';
		copiedTo = page.url.searchParams.get('kopiert');
	});

	let shareLink = $state<string | null>(null);

	/** The share sheet of the phone, otherwise the clipboard, otherwise the link to copy by hand */
	const share = async () => {
		const url = page.url.origin + page.url.pathname;
		if (navigator.share) {
			try {
				await navigator.share({ title: recipe.title, url });
				return;
			} catch (error) {
				// closing the share sheet is no error
				if ((error as Error).name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			notice = 'Link kopiert.';
		} catch {
			// the clipboard needs https or localhost
			shareLink = url;
		}
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
		const body = await response.json().catch(() => null);
		if (response.status === 409 && body?.url) {
			// copied meanwhile, e.g. in another tab
			await goto(body.url);
			return;
		}
		if (!response.ok) {
			notice = body?.message ?? 'Das Rezept konnte nicht übernommen werden.';
			return;
		}
		await goto(`${body.url}?kopiert=${encodeURIComponent(cookbook.name)}`);
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
		if (copyTargets.length === 1) copyTo(copyTargets[0]);
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
	{#if shareLink}
		<label class="share-link">
			Link zum Kopieren
			<input
				class="input"
				readonly
				value={shareLink}
				onfocus={(event) => event.currentTarget.select()}
			/>
		</label>
	{/if}
	<div class="row actions">
		<button type="button" class="btn" onclick={share}>
			<Share2 size="1em" aria-hidden="true" /> Teilen
		</button>
		{#if user && !canEdit}
			{#if copies.length}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- from the server -->
				<a class="btn" href={copies[0].url} title="Deine Kopie öffnen">
					<BookCheck size="1em" aria-hidden="true" /> In „{copies[0].cookbookName}“
				</a>
				{#if copyTargets.length}
					<button type="button" class="btn btn--quiet" disabled={busy} onclick={startCopy}>
						In weiteres Kochbuch
					</button>
				{/if}
			{:else}
				<button type="button" class="btn" disabled={busy} onclick={startCopy}>
					<BookPlus size="1em" aria-hidden="true" /> In mein Kochbuch
				</button>
			{/if}
		{:else if !user && me.current}
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
			{#each choosing === 'copy' ? copyTargets : moveTargets as cookbook (cookbook.id)}
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
	.share-link {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		width: 100%;
		font-size: 0.875rem;
		color: var(--color-text-muted);
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
