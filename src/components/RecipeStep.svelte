<script lang="ts">
	import type { Step } from '#types';
	import Check from '@lucide/svelte/icons/check';

	export let step: Step;
	export let calcQuantityFunction: (quantity: number) => number;
	let checked = false;
</script>

<!-- a real checkbox, so that space toggles it and screen readers announce the state -->
<label class="step" class:step--done={checked}>
	<input type="checkbox" class="visually-hidden" bind:checked />
	<span class="check" aria-hidden="true"><Check size="1.1em" strokeWidth={2.5} /></span>
	<span class="text">
		<span>{step.description}</span>
		{#if step.linkedIngredients?.length}
			<span class="ingredients">
				{#each step.linkedIngredients as linkedIngredient, ingredientIndex (ingredientIndex)}
					{#if linkedIngredient.quantity}{calcQuantityFunction(linkedIngredient.quantity)}{/if}
					{#if linkedIngredient.unit}{linkedIngredient.unit}{/if}
					{linkedIngredient.name}{#if ingredientIndex < step.linkedIngredients.length - 1},&nbsp;{/if}
				{/each}
			</span>
		{/if}
	</span>
</label>

<style>
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.step {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		padding: 0.85rem 0.5rem;
		line-height: 1.5;
		border-radius: var(--radius-md);
		cursor: pointer;
	}
	.step:hover {
		background: var(--color-surface-muted);
	}
	.step:has(input:focus-visible) {
		outline: 3px solid var(--color-focus);
		outline-offset: 2px;
	}
	.check {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.85rem;
		height: 1.85rem;
		margin-top: -0.15rem;
		color: var(--highlight-color);
		background: var(--color-surface);
		border: 1px dashed var(--highlight-color);
		border-radius: var(--radius-pill);
	}
	.check :global(svg) {
		opacity: 0.4;
	}
	.step:hover .check {
		border-style: solid;
	}
	.step--done .check {
		color: #fff;
		background: var(--highlight-color);
		border-style: solid;
	}
	.step--done .check :global(svg) {
		opacity: 1;
	}
	.step--done .text {
		color: var(--color-text-subtle);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.ingredients {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
