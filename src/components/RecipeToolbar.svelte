<script lang="ts">
	import type { Recipe } from '#types';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { me } from '#lib/me.svelte.js';
	import { slugerize } from '#lib/slugerize.js';

	let { recipe }: { recipe: Recipe } = $props();

	let notice = $state<string | null>(null);
	const canEdit = $derived(me.canEdit(recipe.cookbook.id) || me.current?.user?.role === 'admin');

	onMount(() => {
		if (page.url.searchParams.has('gespeichert')) notice = 'Gespeichert.';
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
</script>

<div class="toolbar">
	{#if notice}<p class="notice" role="status">{notice}</p>{/if}
	<div class="row">
		<button type="button" class="btn" onclick={share}>
			<Share2 size="1em" aria-hidden="true" /> Teilen
		</button>
		{#if canEdit}
			<a
				class="btn"
				href={resolve('/rezept/[id]/[titel]/bearbeiten', {
					id: recipe.id,
					titel: slugerize(recipe.title)
				})}><Pencil size="1em" aria-hidden="true" /> Bearbeiten</a
			>
		{/if}
	</div>
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
	.row {
		margin-left: auto;
	}
</style>
