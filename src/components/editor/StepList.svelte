<script lang="ts">
	import type { IngredientInput, StepInput } from '#lib/recipeInput.js';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { move } from './listUtils';
	import IngredientPicker from './IngredientPicker.svelte';

	let { steps = $bindable(), ingredients }: { steps: StepInput[]; ingredients: IngredientInput[] } =
		$props();

	// steps have no id of their own, the key only has to be stable while editing
	let keys = $state(steps.map(() => crypto.randomUUID()));

	const add = (kind: StepInput['kind']) => {
		steps.push({ kind, text: '', links: [] });
		keys.push(crypto.randomUUID());
	};

	const moveStep = (index: number, direction: -1 | 1) => {
		move(steps, index, direction);
		move(keys, index, direction);
	};

	const remove = (index: number) => {
		steps.splice(index, 1);
		keys.splice(index, 1);
	};

	const ingredientById = $derived(new Map(ingredients.map((i) => [i.clientId, i])));
</script>

<ol class="list">
	{#each steps as step, index (keys[index])}
		<li class="step" class:section={step.kind === 'section'}>
			<div class="header">
				<span class="number">
					{step.kind === 'section'
						? 'Abschnitt'
						: `Schritt ${steps.slice(0, index + 1).filter((s) => s.kind === 'step').length}`}
				</span>
				<div class="row-actions">
					<button
						type="button"
						class="btn btn--icon"
						aria-label="Nach oben"
						title="Nach oben"
						disabled={index === 0}
						onclick={() => moveStep(index, -1)}><ArrowUp size={18} aria-hidden="true" /></button
					>
					<button
						type="button"
						class="btn btn--icon"
						aria-label="Nach unten"
						title="Nach unten"
						disabled={index === steps.length - 1}
						onclick={() => moveStep(index, 1)}><ArrowDown size={18} aria-hidden="true" /></button
					>
					<button
						type="button"
						class="btn btn--icon btn--danger"
						aria-label="Entfernen"
						title="Entfernen"
						onclick={() => remove(index)}><Trash2 size={18} aria-hidden="true" /></button
					>
				</div>
			</div>

			{#if step.kind === 'section'}
				<input
					class="section-input"
					placeholder="Abschnitt, z.B. Füllung"
					aria-label="Abschnitt"
					bind:value={step.text}
					required
				/>
			{:else}
				<textarea
					rows="2"
					placeholder="Was ist zu tun?"
					aria-label="Beschreibung"
					bind:value={step.text}
					required></textarea>

				{#if ingredients.some((i) => i.kind === 'ingredient')}
					<IngredientPicker {step} {ingredients} />
				{/if}

				{#if step.links.length}
					<details class="partial">
						<summary>Nur einen Teil einer Zutat verwenden?</summary>
						{#each step.links as link (link.ingredientId)}
							{@const ingredient = ingredientById.get(link.ingredientId)}
							{#if ingredient}
								<label class="partial-row">
									<span>{ingredient.name}</span>
									<input
										type="number"
										step="any"
										min="0"
										placeholder={ingredient.quantity ? String(ingredient.quantity) : 'Menge'}
										bind:value={link.quantity}
									/>
									<span>{ingredient.unit ?? ''}</span>
								</label>
							{/if}
						{/each}
					</details>
				{/if}
			{/if}
		</li>
	{/each}
</ol>

<div class="add">
	<button type="button" class="btn" onclick={() => add('step')}
		><Plus size={18} aria-hidden="true" /> Schritt</button
	>
	<button type="button" class="btn" onclick={() => add('section')}
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
		gap: 1em;
	}
	.step {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		padding: 0.75em;
		border: 1px solid #e3e3e3;
		border-radius: 6px;
	}
	.section {
		background: #f7f7f7;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.number {
		font-size: 0.85em;
		color: #777;
	}
	.row-actions {
		display: flex;
		gap: 0.2em;
	}
	.section-input {
		font-weight: 500;
	}
	textarea {
		resize: vertical;
	}
	.partial {
		font-size: 0.9em;
	}
	.partial summary {
		cursor: pointer;
		color: #777;
	}
	.partial-row {
		display: flex;
		align-items: center;
		gap: 0.5em;
		margin-top: 0.4em;
	}
	.partial-row input {
		width: 6em;
	}
	@media (max-width: 600px) {
		.step {
			padding: 0.6em;
		}
		.partial-row span:first-child {
			flex: 1;
		}
	}
	.add {
		display: flex;
		gap: 0.5em;
		margin-top: 0.75em;
	}
</style>
