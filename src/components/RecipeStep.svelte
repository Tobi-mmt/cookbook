<script lang="ts">
	import type { Step } from 'src/types';

	export let step: Step;
	let checked = false;
</script>

<div class="wrapper" on:click={() => (checked = !checked)} on:keydown={() => (checked = !checked)}>
	<span class={`decoration ${checked && 'decoration__active'}`}>
		<span class={`decoration--text ${checked && 'decoration--text__active'}`}>✔</span>
	</span>
	<span>{step.description}</span>
	<div class="ingredients">
		{#if step?.linkedIngredients}
			{#each step?.linkedIngredients as linkedIngredient, ingredientIndex}
				<span>
					{#if linkedIngredient.quantity}{linkedIngredient.quantity}{/if}
					{#if linkedIngredient.unit}{linkedIngredient.unit}{/if}
					{#if linkedIngredient.name}{linkedIngredient.name}{/if}
					{#if ingredientIndex < step?.linkedIngredients.length - 1},{/if}
				</span>
			{/each}
		{/if}
	</div>
</div>

<style>
	.wrapper {
		padding: 1em 0;
		margin-left: 0.75rem;
		cursor: pointer;
		border-radius: 5px;
	}
	.wrapper:focus,
	.wrapper:hover {
		background-color: #fafafa;
	}
	.wrapper:focus .decoration,
	.wrapper:hover .decoration {
		border-style: solid;
	}
	.decoration {
		color: var(--highlight-color);
		display: inline-block;
		width: 2rem;
		height: 2rem;
		font-size: 1rem;
		margin-left: -2.75rem;
		border-radius: 999px;
		text-align: center;
		padding-top: 0.35rem;
		position: absolute;
		margin-top: -0.4rem;
		border: 1px dashed var(--highlight-color);
		background: white;
	}
	.decoration__active {
		background-color: var(--highlight-color);
		color: #fff;
	}
	.decoration--text {
		color: var(--highlight-color);
		opacity: 0.5;
	}
	.decoration--text__active {
		color: #fff;
		opacity: 1;
	}
	.ingredients {
		font-size: 0.75em;
		opacity: 0.7;
		margin-top: 0.25em;
	}
</style>
