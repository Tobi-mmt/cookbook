<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import Search from '$components/Search.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { loadRecipeIndex } from '$lib/recipeIndex';

	onMount(loadRecipeIndex);

	let isSearchOpen = false;
</script>

<div class="top-bar">
	<a class="word-icon" href={resolve('/', {})}>
		<span class="word">Unser </span>
		<Icon style="font-size: 3em;" name="spoon-and-fork" />
		<span class="word"> Kochbuch</span>
	</a>

	<div
		tabindex="0"
		role="button"
		aria-label="Suche öffnen"
		on:click={() => (isSearchOpen = true)}
		on:keypress={() => (isSearchOpen = true)}
		class="action-icon"
	>
		<Icon name="search" />
	</div>
</div>

<Search bind:searchOpen={isSearchOpen} />

<style>
	.top-bar {
		align-items: center;
		background: #fff;
		box-shadow: 0 0 15px #0003;
		/* the empty outer columns keep the logo centered */
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		padding: 0.5em 1.5em;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.word-icon {
		grid-column: 2;
		display: flex;
		align-items: center;
		color: #333;
		text-decoration: none;
	}
	.word {
		margin: 0 0.5em;
	}
	.action-icon {
		justify-self: end;
		font-size: 1.25em;
		cursor: pointer;
	}
</style>
