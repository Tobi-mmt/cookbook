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
	import CookbookPicker, { type CookbookTarget } from '#components/CookbookPicker.svelte';
	import Dialog from '#components/Dialog.svelte';
	import ShareCookbookDialog from '#components/ShareCookbookDialog.svelte';

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
	let copied = $state(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

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
			copied = true;
			clearTimeout(copiedTimeout);
			copiedTimeout = setTimeout(() => (copied = false), 2500);
		} catch {
			// the clipboard needs https or localhost
			shareLink = url;
		}
	};

	type TargetCookbook = { id: string; name: string; path: string };
	/** after moving into or copying to a new cookbook, it can be shared right away */
	let shareTarget = $state<{ message: string; cookbook: TargetCookbook } | null>(null);

	const post = (action: 'kopieren' | 'verschieben', target: CookbookTarget) =>
		fetch(`/api/rezept/${recipe.id}/${action}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(target)
		});

	const copyTo = async (target: CookbookTarget) => {
		busy = true;
		const response = await post('kopieren', target);
		busy = false;
		const body = await response.json().catch(() => null);
		if (response.status === 409 && body?.url) {
			// copied meanwhile, e.g. in another tab
			choosing = null;
			await goto(body.url);
			return;
		}
		if (!response.ok) {
			notice = body?.message ?? 'Das Rezept konnte nicht übernommen werden.';
			return;
		}
		choosing = null;
		if (body.isNew) await me.refresh();
		const shareParam = body.isNew ? `&teilen=${body.cookbook.id}` : '';
		await goto(`${body.url}?kopiert=${encodeURIComponent(body.cookbook.name)}${shareParam}`);
	};

	const moveTo = async (target: CookbookTarget) => {
		busy = true;
		const response = await post('verschieben', target);
		busy = false;
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			notice = body?.message ?? 'Das Rezept konnte nicht verschoben werden.';
			return;
		}
		choosing = null;
		if (body.isNew) {
			await me.refresh();
			shareTarget = {
				message: `„${recipe.title}“ ist jetzt im neuen Kochbuch „${body.cookbook.name}“.`,
				cookbook: body.cookbook
			};
		} else {
			notice = `Verschoben nach „${body.cookbook.name}“.`;
		}
		await goto(page.url.pathname, { invalidateAll: true, replace: true, reset: false });
	};

	const startMove = () => {
		notice = null;
		choosing = 'move';
	};

	const startCopy = () => {
		notice = null;
		if (copyTargets.length === 1 && !copies.length) copyTo({ cookbookId: copyTargets[0].id });
		else choosing = 'copy';
	};

	// the copy page shows the share panel for the new cookbook of the copy
	$effect(() => {
		const sharedId = page.url.searchParams.get('teilen');
		const cookbook = me.current?.cookbooks.find(({ id }) => id === sharedId);
		if (!cookbook || shareTarget) return;
		shareTarget = {
			message: `Kopie im neuen Kochbuch „${cookbook.name}“ angelegt.`,
			cookbook: {
				id: cookbook.id,
				name: cookbook.name,
				path: `/@${cookbook.ownerUsername}/${cookbook.slug}`
			}
		};
	});
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
		<span class="share">
			<button type="button" class="btn" onclick={share}>
				<Share2 size="1em" aria-hidden="true" /> Teilen
			</button>
			<span class="bubble" class:bubble--visible={copied} role="status" aria-live="polite"
				>{copied ? 'Link kopiert' : ''}</span
			>
		</span>
		{#if user && !canEdit}
			{#if copies.length}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- from the server -->
				<a class="btn" href={copies[0].url} title="Deine Kopie öffnen">
					<BookCheck size="1em" aria-hidden="true" /> In „{copies[0].cookbookName}“
				</a>
				<button type="button" class="btn btn--quiet" disabled={busy} onclick={startCopy}>
					In weiteres Kochbuch
				</button>
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
			{#if user}
				<button type="button" class="btn" disabled={busy} onclick={startMove}>
					<FolderInput size="1em" aria-hidden="true" /> Verschieben nach …
				</button>
			{/if}
		{/if}
	</div>
	<Dialog
		open={Boolean(choosing)}
		title={choosing === 'copy' ? 'In welches Kochbuch?' : 'Wohin verschieben?'}
		onclose={() => (choosing = null)}
	>
		{#if notice && choosing}<p class="message message--error" role="alert">{notice}</p>{/if}
		<CookbookPicker
			cookbooks={choosing === 'copy' ? copyTargets : moveTargets}
			{busy}
			onpick={(target) => (choosing === 'copy' ? copyTo(target) : moveTo(target))}
		/>
	</Dialog>
	{#if shareTarget}
		<ShareCookbookDialog open title={shareTarget.message} cookbook={shareTarget.cookbook} />
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
	.share {
		position: relative;
	}
	/* the feedback appears right above the button and fades out again */
	.bubble {
		position: absolute;
		bottom: calc(100% + 0.4rem);
		left: 50%;
		padding: 0.3rem 0.7rem;
		font-size: 0.8125rem;
		white-space: nowrap;
		color: #fff;
		background: var(--color-dark);
		border-radius: var(--radius-pill);
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 0.25rem);
		transition:
			opacity 0.15s,
			transform 0.15s;
	}
	.bubble--visible {
		opacity: 1;
		transform: translate(-50%, 0);
	}
	.share-link {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		width: 100%;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
