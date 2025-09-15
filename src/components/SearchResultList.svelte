<script lang="ts">
	import type { FuseResult } from 'fuse.js';
	import type { Recipe } from '$types';
	import { slugerize } from '$lib/slugerize';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	export let searchOpen: boolean;
	export let searchValue: string;
	export let searchResults: FuseResult<Recipe>[];

	const handleKeydown = (event: KeyboardEvent) => {
		const { key } = event;
		if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
		event.preventDefault();

		const current = document.activeElement as HTMLUListElement;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const items = [...document.querySelectorAll<HTMLButtonElement>('button.search-list-item')];
		const currentIndex = items.indexOf(current);
		let newIndex: number;

		if (currentIndex === -1) {
			newIndex = 0;
		} else {
			if (key === 'ArrowUp') newIndex = (currentIndex + items.length - 1) % items.length;
			else newIndex = (currentIndex + 1) % items.length;
		}

		current.blur();
		items[newIndex].focus();
	};

	const handleListItemNavigation = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const { href } = (event.target as HTMLUListElement).firstChild as HTMLAnchorElement;
			goto(resolve(href, {}));
			searchOpen = false;
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="results__list">
	{#if searchValue.length > 1}
		{#if searchResults.length}
			{#each searchResults as searchResult (searchResult.item.id)}
				<button class="search-list-item" tabindex={0} on:keydown={handleListItemNavigation}>
					<a
						href={resolve(`/recipe/[recipeId]/[recipeTitle]`, {
							recipeId: searchResult.item.id,
							recipeTitle: slugerize(searchResult.item.title)
						})}
						class="results__list__item"
						on:click={() => (searchOpen = false)}
					>
						<p class="category">{searchResult.item.meta.category}</p>
						<p class="title">{searchResult.item.title}</p>
					</a>
				</button>
			{/each}
		{:else}
			<li><p>Keine Ergebnisse</p></li>
		{/if}
	{:else}
		<li><p>Suche nach Rezepten oder einer Zutat</p></li>
	{/if}
</div>

<style>
	.results__list {
		list-style: none;
		padding: 1em;
		margin: 0;
	}
	.results__list__item {
		display: block;
		padding: 0.5em 1em;
		text-decoration: none;
		color: inherit;
	}
	.search-list-item {
		border: none;
		background-color: transparent;
		padding: 0;
		margin: 0;
		width: 100%;
		text-align: left;
	}
	button:focus .results__list__item,
	button:active .results__list__item,
	button:hover .results__list__item {
		background-color: aliceblue;
		cursor: pointer;
	}
	.category {
		font-size: 0.75em;
		color: #888;
	}
</style>
