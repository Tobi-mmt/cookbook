<script lang="ts">
	import Fuse from 'fuse.js';
	import { fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import { categoryColors } from '$lib/colors';
	import { loadRecipeIndex, recipeIndex, searchOpen } from '$lib/recipeIndex';
	import { slugerize } from '$lib/slugerize';

	let searchValue = '';
	let inputRef: HTMLInputElement | undefined;
	let listRef: HTMLUListElement | undefined;

	const fuseOptions = {
		minMatchCharLength: 2,
		threshold: 0.5,
		keys: [
			{ name: 'title', weight: 0.8 },
			{ name: 'ingredients.name', weight: 0.2 }
		]
	};

	$: fuse = new Fuse($recipeIndex, fuseOptions);
	// also updates when the index arrives after the first letters were typed
	$: results = searchValue.length > 1 ? fuse.search(searchValue, { limit: 8 }) : [];
	$: loading = $searchOpen && !$recipeIndex.length;

	$: if ($searchOpen) {
		loadRecipeIndex();
		// the input exists after this tick
		setTimeout(() => inputRef?.focus(), 0);
	}

	const close = () => searchOpen.set(false);

	/** arrow keys move between the input and the results */
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') return close();
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		const links = [...(listRef?.querySelectorAll('a') ?? [])];
		if (!links.length) return;
		event.preventDefault();
		const current = links.indexOf(document.activeElement as HTMLAnchorElement);
		const next =
			event.key === 'ArrowDown' ? (current + 1) % links.length : current <= 0 ? -1 : current - 1;
		if (next === -1) inputRef?.focus();
		else links[next].focus();
	};
</script>

{#if $searchOpen}
	<!-- clicking next to the dialog closes it, the keyboard uses Escape -->
	<div
		class="backdrop"
		aria-hidden="true"
		transition:fade={{ duration: 200 }}
		on:click={close}
	></div>
	<div
		class="dialog"
		role="dialog"
		aria-modal="true"
		aria-label="Rezepte suchen"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
		on:keydown={handleKeydown}
	>
		<input
			type="search"
			placeholder="Rezept oder Zutat suchen"
			aria-label="Rezept oder Zutat suchen"
			class="search-input"
			bind:this={inputRef}
			bind:value={searchValue}
		/>

		{#if searchValue.length < 2}
			<p class="hint">Suche nach einem Rezept oder einer Zutat</p>
		{:else if loading}
			<p class="hint">Rezepte werden geladen…</p>
		{:else if !results.length}
			<p class="hint">Keine Ergebnisse</p>
		{:else}
			<ul class="results" bind:this={listRef}>
				{#each results as { item } (item.id)}
					<li>
						<a
							href={resolve('/recipe/[recipeId]/[recipeTitle]', {
								recipeId: item.id,
								recipeTitle: slugerize(item.title)
							})}
							on:click={close}
						>
							<span class="category" style="--color: {categoryColors[item.meta.category]}"
								>{item.meta.category}</span
							>
							<span class="title">{item.title}</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 199;
		background: rgb(0 0 0 / 0.25);
		cursor: pointer;
	}
	.dialog {
		position: fixed;
		top: calc(var(--top-bar-height) + 1rem);
		left: 50%;
		z-index: 200;
		transform: translateX(-50%);
		width: min(90%, 1200px);
		max-height: calc(100vh - var(--top-bar-height) - 2rem);
		overflow-y: auto;
		padding: 0.5rem;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.15);
	}
	.search-input {
		position: sticky;
		top: 0;
		width: 100%;
		padding: 0.6rem 1rem;
		font: inherit;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}
	.hint {
		margin: 0;
		padding: 1rem;
		color: var(--color-text-muted);
	}
	.results {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
	}
	.results a {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 1rem;
		color: inherit;
		text-decoration: none;
		border-radius: var(--radius-sm);
	}
	.results a:hover,
	.results a:focus-visible {
		background: var(--color-surface-muted);
	}
	.category {
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}
	.category::before {
		content: '';
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: var(--color);
	}
</style>
