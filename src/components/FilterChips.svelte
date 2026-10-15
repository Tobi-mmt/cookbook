<script lang="ts">
	import type { Category } from '#types';
	import { page } from '$app/state';
	import { readFilter, type Diet } from '#lib/recipeFilter.js';
	import { setFilterParam } from '#lib/filterNavigation.js';

	let { categories, children }: { categories: Category[]; children?: import('svelte').Snippet } =
		$props();

	const diets: Diet[] = ['Vegetarisch', 'Vegan'];
	const filter = $derived(readFilter(page.shallow?.url ?? page.url));
</script>

<div class="chips" role="group" aria-label="Rezepte filtern">
	{@render children?.()}
	<button
		type="button"
		class="chip"
		aria-pressed={!filter.category}
		onclick={() => setFilterParam('kategorie', null)}>Alle</button
	>
	{#each categories as item (item.id)}
		<button
			type="button"
			class="chip"
			style="--color: {item.color}"
			aria-pressed={filter.category === item.slug}
			onclick={() => setFilterParam('kategorie', filter.category === item.slug ? null : item.slug)}
		>
			<span class="dot" aria-hidden="true"></span>
			{item.name}
		</button>
	{/each}
	<span class="divider" aria-hidden="true"></span>
	{#each diets as item (item)}
		<button
			type="button"
			class="chip"
			aria-pressed={filter.diet === item}
			onclick={() => setFilterParam('ernaehrung', filter.diet === item ? null : item)}
			>{item}</button
		>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		align-items: center;
		justify-content: safe center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		/* centered while it fits, otherwise one row that scrolls sideways on narrow screens */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.chips::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		min-height: 2.25rem;
		padding: 0.35em 0.9em;
		font: inherit;
		font-size: 0.875rem;
		line-height: 1.2;
		color: var(--color-text-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		cursor: pointer;
		transition:
			background-color 0.15s,
			border-color 0.15s;
	}
	.chip:hover {
		border-color: var(--color-text-subtle);
	}
	.chip[aria-pressed='true'] {
		color: #fff;
		background: var(--color-dark);
		border-color: var(--color-dark);
	}
	.dot {
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: var(--color);
	}
	.divider {
		flex: none;
		width: 1px;
		height: 1.5rem;
		margin: 0 0.25rem;
		background: var(--color-border);
	}
	@media (max-width: 599px) {
		.chips {
			justify-content: flex-start;
			padding: 0.75rem 1rem;
		}
	}
</style>
