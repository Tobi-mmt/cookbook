<script lang="ts">
	import type { IngredientInput, StepInput } from '$lib/recipeInput';
	import { move } from './listUtils';

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

	const isLinked = (step: StepInput, clientId: string) =>
		step.links.some((link) => link.ingredientId === clientId);

	const toggle = (step: StepInput, clientId: string) => {
		const index = step.links.findIndex((link) => link.ingredientId === clientId);
		if (index === -1) step.links.push({ ingredientId: clientId, quantity: null });
		else step.links.splice(index, 1);
	};

	const ingredientLabel = (ingredient: IngredientInput) =>
		[ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ') || '(leer)';

	const ingredientById = $derived(new Map(ingredients.map((i) => [i.clientId, i])));

	/** ingredients grouped by their section for the chip list */
	const groups = $derived(
		ingredients.reduce<{ section: string | null; items: IngredientInput[] }[]>(
			(acc, ingredient) => {
				if (ingredient.kind === 'section') acc.push({ section: ingredient.name, items: [] });
				else acc[acc.length - 1].items.push(ingredient);
				return acc;
			},
			[{ section: null, items: [] }]
		)
	);
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
						class="button"
						aria-label="Nach oben"
						disabled={index === 0}
						onclick={() => moveStep(index, -1)}>↑</button
					>
					<button
						type="button"
						class="button"
						aria-label="Nach unten"
						disabled={index === steps.length - 1}
						onclick={() => moveStep(index, 1)}>↓</button
					>
					<button
						type="button"
						class="button button--danger"
						aria-label="Entfernen"
						onclick={() => remove(index)}>✕</button
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
					required
				></textarea>

				{#if ingredients.some((i) => i.kind === 'ingredient')}
					<div class="chips" role="group" aria-label="Zutaten für diesen Schritt">
						{#each groups as group, groupIndex (groupIndex)}
							{#if group.items.length}
								{#if group.section}<span class="chip-section">{group.section}:</span>{/if}
								{#each group.items as ingredient (ingredient.clientId)}
									<button
										type="button"
										class="chip"
										class:chip--active={isLinked(step, ingredient.clientId)}
										aria-pressed={isLinked(step, ingredient.clientId)}
										onclick={() => toggle(step, ingredient.clientId)}
										>{ingredientLabel(ingredient)}</button
									>
								{/each}
							{/if}
						{/each}
					</div>
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
	<button type="button" class="button" onclick={() => add('step')}>+ Schritt</button>
	<button type="button" class="button" onclick={() => add('section')}>+ Abschnitt</button>
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
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35em;
		align-items: center;
	}
	.chip-section {
		font-size: 0.8em;
		font-style: italic;
		color: #777;
		margin-left: 0.4em;
	}
	.chip {
		font: inherit;
		font-size: 0.85em;
		padding: 0.2em 0.7em;
		border: 1px solid #ccc;
		border-radius: 999px;
		background: #fff;
		cursor: pointer;
	}
	.chip--active {
		background: #8882a8;
		border-color: #8882a8;
		color: #fff;
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
	.add {
		display: flex;
		gap: 0.5em;
		margin-top: 0.75em;
	}
</style>
