<script lang="ts">
	import type { IngredientInput } from '#lib/recipeInput.js';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { move, newClientId } from './listUtils';

	let {
		ingredients = $bindable(),
		onremove
	}: { ingredients: IngredientInput[]; onremove: (clientId: string) => void } = $props();

	const add = (kind: IngredientInput['kind']) => {
		ingredients.push({ clientId: newClientId(), kind, name: '', quantity: null, unit: null });
	};

	const remove = (index: number) => {
		const [removed] = ingredients.splice(index, 1);
		onremove(removed.clientId);
	};
</script>

<ol class="list">
	{#each ingredients as ingredient, index (ingredient.clientId)}
		<li class="row" class:section={ingredient.kind === 'section'}>
			{#if ingredient.kind === 'section'}
				<input
					class="name"
					placeholder="Abschnitt, z.B. Teig"
					aria-label="Abschnitt"
					bind:value={ingredient.name}
					required
				/>
			{:else}
				<input
					class="quantity"
					type="number"
					step="any"
					min="0"
					placeholder="Menge"
					aria-label="Menge"
					bind:value={ingredient.quantity}
				/>
				<input
					class="unit"
					placeholder="Einheit"
					aria-label="Einheit"
					bind:value={ingredient.unit}
				/>
				<input
					class="name"
					placeholder="Zutat"
					aria-label="Zutat"
					bind:value={ingredient.name}
					required
				/>
			{/if}
			<div class="row-actions">
				<button
					type="button"
					class="button button--icon"
					aria-label="Nach oben"
					title="Nach oben"
					disabled={index === 0}
					onclick={() => move(ingredients, index, -1)}
					><ArrowUp size={18} aria-hidden="true" /></button
				>
				<button
					type="button"
					class="button button--icon"
					aria-label="Nach unten"
					title="Nach unten"
					disabled={index === ingredients.length - 1}
					onclick={() => move(ingredients, index, 1)}
					><ArrowDown size={18} aria-hidden="true" /></button
				>
				<button
					type="button"
					class="button button--icon button--danger"
					aria-label="Entfernen"
					title="Entfernen"
					onclick={() => remove(index)}><Trash2 size={18} aria-hidden="true" /></button
				>
			</div>
		</li>
	{/each}
</ol>

<div class="add">
	<button type="button" class="button" onclick={() => add('ingredient')}
		><Plus size={18} aria-hidden="true" /> Zutat</button
	>
	<button type="button" class="button" onclick={() => add('section')}
		><Plus size={18} aria-hidden="true" /> Abschnitt</button
	>
</div>

<style>
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
	}
	.row {
		display: flex;
		gap: 0.4em;
		align-items: center;
	}
	.section {
		margin-top: 0.75em;
	}
	.section .name {
		font-weight: bold;
		font-style: italic;
	}
	.quantity {
		width: 5.5em;
	}
	.unit {
		width: 7em;
	}
	.name {
		flex: 1;
	}
	.row-actions {
		display: flex;
		gap: 0.2em;
	}
	.add {
		display: flex;
		gap: 0.5em;
		margin-top: 0.75em;
	}
	@media (max-width: 600px) {
		.row:not(.section) {
			flex-wrap: wrap;
			padding-bottom: 0.6em;
			border-bottom: 1px solid #eee;
		}
		.row:not(.section) .name {
			flex-basis: 100%;
			order: -1;
		}
		.quantity,
		.unit {
			flex: 1;
			width: auto;
			min-width: 0;
		}
	}
</style>
