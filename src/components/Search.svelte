<script lang="ts">
	import ListNavigation from './SearchResultList.svelte';

	import { fade } from 'svelte/transition';
	import Fuse from 'fuse.js';
	import { recipes } from '$lib/recipes';

	export let searchOpen: boolean;
	let searchValue = '';
	let searchResults = [];
	let inputRef: HTMLInputElement;

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
	<div class="modal" transition:fade={{ duration: 250 }}>
		<div class="modal__background">
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

			<ListNavigation {searchResults} bind:searchOpen {searchValue} />
		</div>
	</div>

	<div
		tabindex="0"
		role="button"
		class="modal__click-out"
		transition:fade={{ duration: 250 }}
		on:click={() => (searchOpen = false)}
		on:keydown={() => (searchOpen = false)}
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
	.modal {
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
	.modal__click-out {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 199;
		background-color: #000;
		opacity: 0.25;
		cursor: pointer;
		transition:
			visibility 0s,
			opacity 0.2s ease-in-out;
	}
	.modal__background {
		background-color: #fff;
		border-radius: 5px;
	}
</style>
