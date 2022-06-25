<script lang="ts">
	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';
	import { recipes } from '../lib/recipes';
	import { slugerize } from '../lib/slugerize';

	export let searchOpen = false;
	let searchValue = '';
	let searchResults = [];
	let inputRef;

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

	const handleInputchange = (event: KeyboardEvent) => {
		const { value } = event.target as HTMLInputElement;
		searchResults = fuse.search(value, { limit: 8 });
	};
</script>

{#if searchOpen}
	<div class="off-canvas" transition:fade={{ duration: 250 }}>
		<div class="off-canvas__background">
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus
				type="text"
				placeholder="Suche"
				class="search-input"
				bind:this={inputRef}
				bind:value={searchValue}
				on:keyup={handleInputchange}
				on:keydown={(event) => {
					if (event.key === 'Escape') {
						searchOpen = false;
						inputRef.blur();
					}
				}}
			/>
			<div class="results">
				<ul class="results__list">
					{#if searchValue.length > 1}
						{#if searchResults.length}
							{#each searchResults as searchResult}
								<li>
									<a
										href={`#${slugerize(searchResult.item.title)}`}
										class="results__list__item"
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
			</div>
		</div>
	</div>

	<div
		class="off-canvas__click-out"
		transition:fade={{ duration: 250 }}
		on:click={() => (searchOpen = false)}
	/>
{/if}

<style>
	.search-input {
		background-color: #fff;
	}
	.search-input {
		width: calc(100% - 4px);
		border: 1px solid #aaa;
		border-radius: 4px;
		font-size: 1rem;
		min-width: 125px;
		padding: 0.5rem 1em;
		transition: all 0.15s linear;
		margin: 2px;
		position: sticky;
		top: 2px;
	}
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
	.results__list__item:hover {
		background-color: aliceblue;
		cursor: pointer;
	}
	.category {
		font-size: 0.75em;
		color: #888;
	}
	.off-canvas {
		width: 90%;
		max-width: 1202px;
		max-height: 82vh;
		position: fixed;
		top: 6.85em;
		z-index: 200;
		transition: all 0.2s ease-out;
		overflow-x: hidden;
		left: 50%;
		transform: translate(-50%);
	}
	.off-canvas__click-out {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 199;
		background-color: #000;
		opacity: 0.25;
		cursor: pointer;
		transition: visibility 0s, opacity 0.2s ease-in-out;
	}
	.off-canvas__background {
		background-color: #fff;
		border-radius: 4px;
	}
</style>
