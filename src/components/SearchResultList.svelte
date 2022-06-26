<script lang="ts">
	import Fuse from 'fuse.js';
	import { recipes } from '../lib/recipes';
	import { slugerize } from '../lib/slugerize';
	import { goto } from '$app/navigation';

	export let searchOpen = false;
	export let searchValue = '';
	export let searchResults = [];

	const fuseOptions = {
		minMatchCharLength: 2,
		threshold: 0.5,
		keys: [
			{
				name: 'title',
				weight: 0.8
			},
			{
				name: 'ingredients.name',
				weight: 0.2
			}
		]
	};
	const fuse = new Fuse(recipes, fuseOptions);

	const handleKeydown = (event: KeyboardEvent) => {
		const { key } = event;
		if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
		event.preventDefault();

		const current = document.activeElement as HTMLUListElement;
		// @ts-ignore
		const items = [...document.querySelectorAll<HTMLUListElement>('li.search-list-item')];
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
			goto(href);
			searchOpen = false;
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<ul class="results__list">
	{#if searchValue.length > 1}
		{#if searchResults.length}
			{#each searchResults as searchResult}
				<li class="search-list-item" tabindex="0" on:keydown={handleListItemNavigation}>
					<a
						href={`#${slugerize(searchResult.item.title)}`}
						class={'results__list__item'}
						on:click={() => (searchOpen = false)}
					>
						<p class="category">{searchResult.item.meta.category}</p>
						<p class="title">{searchResult.item.title}</p>
					</a>
				</li>
			{/each}
		{:else}
			<li><p>Keine Ergebnisse</p></li>
		{/if}
	{:else}
		<li><p>Suche nach Rezepten oder einer Zutat</p></li>
	{/if}
</ul>

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
	li:focus .results__list__item,
	li:active .results__list__item,
	li:hover .results__list__item {
		background-color: aliceblue;
		cursor: pointer;
	}
	.category {
		font-size: 0.75em;
		color: #888;
	}
</style>
