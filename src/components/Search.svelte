<script lang="ts">
	import Fuse from 'fuse.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { categoryColors } from '#lib/colors.js';
	import { loadRecipeIndex, recipeIndex } from '#lib/recipeIndex.js';
	import { slugerize } from '#lib/slugerize.js';

	/** on phones the field is hidden behind a button and takes the whole top bar when open */
	export let expanded = false;

	let searchValue = '';
	let active = false;
	let root: HTMLDivElement | undefined;
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
	$: query = searchValue.trim();
	$: results = query.length > 1 ? fuse.search(query, { limit: 8 }) : [];
	$: showPanel = active && query.length > 1;

	const activate = () => {
		loadRecipeIndex();
		active = true;
	};

	const close = () => {
		active = false;
		expanded = false;
	};

	const expand = () => {
		expanded = true;
		activate();
		// the field becomes visible with the next render
		setTimeout(() => inputRef?.focus(), 0);
	};

	afterNavigate(({ shallow, type }) => {
		if (shallow && type === 'goto') return;

		searchValue = '';
		close();
		inputRef?.blur();
	});

	/** closes when the focus leaves the search, e.g. by tabbing away or tapping elsewhere */
	const handleFocusOut = (event: FocusEvent) => {
		if (!root?.contains(event.relatedTarget as Node | null)) active = false;
	};

	/** arrow keys move between the field and the results, Escape closes */
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			close();
			inputRef?.blur();
			return;
		}
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="search"
	class:search--expanded={expanded}
	bind:this={root}
	on:focusout={handleFocusOut}
	on:keydown={handleKeydown}
>
	<button
		type="button"
		class="icon-button open-button"
		aria-label="Suche öffnen"
		on:pointerenter={loadRecipeIndex}
		on:click={expand}
	>
		<SearchIcon size="1.25em" aria-hidden="true" />
	</button>

	<label class="field">
		<SearchIcon size="1.1em" aria-hidden="true" />
		<input
			type="search"
			placeholder="Rezept oder Zutat suchen"
			aria-label="Rezept oder Zutat suchen"
			role="combobox"
			aria-autocomplete="list"
			aria-controls="search-results"
			aria-expanded={showPanel}
			autocomplete="off"
			bind:this={inputRef}
			bind:value={searchValue}
			on:pointerenter={loadRecipeIndex}
			on:focus={activate}
			on:input={() => (active = true)}
		/>
	</label>

	<button type="button" class="cancel-button" on:click={close}>Abbrechen</button>

	{#if showPanel}
		<div class="panel" id="search-results">
			{#if !$recipeIndex.length}
				<p class="hint">Rezepte werden geladen…</p>
			{:else if !results.length}
				<p class="hint">Keine Rezepte zu „{query}“</p>
			{:else}
				<ul class="results" bind:this={listRef}>
					{#each results as { item } (item.id)}
						<li>
							<a
								href={resolve('/recipe/[...recipeSlug]', {
									recipeSlug: `${item.id}/${slugerize(item.title)}`
								})}
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
</div>

<style>
	.search {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 20rem;
		height: 2.5rem;
		padding: 0 1rem;
		color: var(--color-text-subtle);
		background: var(--color-surface-muted);
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		cursor: text;
		transition: border-color 0.15s;
	}
	.field:hover,
	.field:focus-within {
		border-color: var(--color-border);
		background: var(--color-surface);
	}
	.field:has(input:focus-visible) {
		outline: 3px solid var(--color-focus);
		outline-offset: 2px;
	}
	input {
		flex: 1;
		min-width: 0;
		padding: 0;
		font: inherit;
		/* at least 16px, otherwise iOS zooms into the page */
		font-size: 1rem;
		color: var(--color-text);
		background: none;
		border: none;
		outline: none;
	}
	input::placeholder {
		color: var(--color-text-subtle);
	}
	.icon-button {
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
	.icon-button:hover {
		background: var(--color-surface-muted);
	}
	.open-button,
	.cancel-button {
		display: none;
	}
	.cancel-button {
		flex: none;
		padding: 0.5rem 0.25rem;
		font: inherit;
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
	}

	.panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: max(100%, 26rem);
		max-height: calc(100vh - var(--top-bar-height) - 2rem);
		overflow-y: auto;
		padding: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
	}
	.hint {
		margin: 0;
		padding: 0.75rem 1rem;
		color: var(--color-text-muted);
	}
	.results {
		list-style: none;
		margin: 0;
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

	@media (max-width: 699px) {
		.open-button {
			display: flex;
		}
		.field {
			display: none;
		}
		.search--expanded {
			flex: 1;
		}
		.search--expanded .open-button {
			display: none;
		}
		.search--expanded .field {
			display: flex;
			flex: 1;
			width: auto;
		}
		.search--expanded .cancel-button {
			display: block;
		}
		/* the results cover the page below the top bar */
		.panel {
			position: fixed;
			top: var(--top-bar-height);
			left: 0;
			right: 0;
			width: auto;
			max-height: calc(100vh - var(--top-bar-height));
			border: none;
			border-top: 1px solid var(--color-border);
			border-radius: 0;
			box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
		}
	}
</style>
