<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { daysUntil, inDays } from '#lib/daysUntil.js';
	import { me } from '#lib/me.svelte.js';

	const deletionAt = $derived(me.current?.user?.deletionAt);
</script>

<!-- on every page, so that nobody loses their account by surprise -->
{#if deletionAt && !page.url.pathname.startsWith('/konto')}
	<p class="banner" role="status">
		Dein Konto wird {inDays(daysUntil(deletionAt))} gelöscht.
		<a href={resolve('/konto')}>Abbrechen oder Daten herunterladen</a>
	</p>
{/if}

<style>
	.banner {
		margin: 0;
		padding: 0.6rem 1.5rem;
		font-size: 0.9375rem;
		text-align: center;
		color: #b3261e;
		background: var(--color-surface);
		border-bottom: 2px solid #b3261e;
	}
	a {
		margin-left: 0.5rem;
		color: inherit;
	}
</style>
