<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import Utensils from '@lucide/svelte/icons/utensils';
	import Search from '$components/Search.svelte';
	import { resolve } from '$app/paths';
	import { loadRecipeIndex, searchOpen } from '$lib/recipeIndex';
</script>

<header class="top-bar">
	<a class="logo" href={resolve('/', {})}>
		<span>Unser</span>
		<Utensils size="1.75em" strokeWidth={1.5} aria-hidden="true" />
		<span>Kochbuch</span>
	</a>

	<!-- the index loads as soon as the search is likely to be used -->
	<button
		type="button"
		class="search-button"
		aria-label="Suche öffnen"
		on:pointerenter={loadRecipeIndex}
		on:focus={loadRecipeIndex}
		on:click={() => searchOpen.set(true)}
	>
		<SearchIcon size="1.25em" aria-hidden="true" />
	</button>
</header>

<Search />

<style>
	.top-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		/* the empty outer columns keep the logo centered */
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		min-height: var(--top-bar-height);
		padding: 0.5rem 1.5rem;
		background: var(--color-surface);
		box-shadow: 0 0 15px rgb(0 0 0 / 0.2);
	}
	.logo {
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: 0.5em;
		color: var(--color-text);
		text-decoration: none;
	}
	.search-button {
		justify-self: end;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		color: var(--color-text);
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.search-button:hover {
		background: var(--color-surface-muted);
	}
	@media (max-width: 599px) {
		.top-bar {
			padding: 0.5rem 1rem;
		}
	}
</style>
