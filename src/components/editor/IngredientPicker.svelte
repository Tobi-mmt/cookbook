<script lang="ts">
	import type { IngredientInput, StepInput } from '#lib/recipeInput.js';
	import X from '@lucide/svelte/icons/x';

	let { step, ingredients }: { step: StepInput; ingredients: IngredientInput[] } = $props();

	const id = `picker-${crypto.randomUUID()}`;
	let query = $state('');
	let open = $state(false);
	let highlighted = $state(0);
	let input = $state<HTMLInputElement>();

	const sectionOf = $derived(
		ingredients.reduce(
			(map, ingredient, index) =>
				map.set(
					ingredient.clientId,
					ingredients.slice(0, index).findLast((candidate) => candidate.kind === 'section')?.name ??
						null
				),
			new Map<string, string | null>()
		)
	);
	const byId = $derived(
		new Map(ingredients.map((ingredient) => [ingredient.clientId, ingredient]))
	);
	const linked = $derived(step.links.flatMap(({ ingredientId }) => byId.get(ingredientId) ?? []));
	const options = $derived.by(() => {
		const term = query.trim().toLowerCase();
		const text = step.text.toLowerCase();
		const mentioned = (ingredient: IngredientInput) =>
			Number(text.includes(ingredient.name.trim().toLowerCase()));
		return ingredients
			.filter(
				(ingredient) =>
					ingredient.kind === 'ingredient' &&
					ingredient.name.trim() &&
					!step.links.some((link) => link.ingredientId === ingredient.clientId) &&
					ingredient.name.toLowerCase().includes(term)
			)
			.sort((a, b) => mentioned(b) - mentioned(a));
	});

	const label = (ingredient: IngredientInput) =>
		[ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ');

	const add = (ingredient: IngredientInput) => {
		step.links.push({ ingredientId: ingredient.clientId, quantity: null });
		query = '';
		highlighted = 0;
		input?.focus();
	};

	const remove = (clientId: string) => {
		const index = step.links.findIndex((link) => link.ingredientId === clientId);
		if (index !== -1) step.links.splice(index, 1);
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			open = true;
			const step = event.key === 'ArrowDown' ? 1 : -1;
			highlighted = (highlighted + step + options.length) % Math.max(options.length, 1);
		} else if (event.key === 'Enter' && open && options[highlighted]) {
			event.preventDefault();
			add(options[highlighted]);
		} else if (event.key === 'Backspace' && !query && step.links.length) {
			step.links.pop();
		} else if (event.key === 'Escape') {
			open = false;
		}
	};
</script>

<div class="picker" class:picker--open={open}>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="field" onclick={() => input?.focus()}>
		{#each linked as ingredient (ingredient.clientId)}
			<span class="chip">
				{ingredient.name}
				<button
					type="button"
					aria-label="{ingredient.name} entfernen"
					onclick={(event) => {
						event.stopPropagation();
						remove(ingredient.clientId);
					}}><X size="0.9em" aria-hidden="true" /></button
				>
			</span>
		{/each}
		<input
			bind:this={input}
			bind:value={query}
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-controls={id}
			aria-autocomplete="list"
			aria-label="Zutat zu diesem Schritt hinzufügen"
			placeholder={linked.length ? 'Zutat hinzufügen' : 'Welche Zutaten kommen hier dazu?'}
			autocomplete="off"
			onfocus={() => (open = true)}
			onblur={() => (open = false)}
			oninput={() => {
				open = true;
				highlighted = 0;
			}}
			onkeydown={onKeydown}
		/>
	</div>
	{#if open}
		<ul class="options" role="listbox" {id}>
			{#each options as ingredient, index (ingredient.clientId)}
				<li
					role="option"
					aria-selected={index === highlighted}
					class:highlighted={index === highlighted}
					onmousedown={(event) => {
						event.preventDefault();
						add(ingredient);
					}}
				>
					<span>{label(ingredient)}</span>
					{#if sectionOf.get(ingredient.clientId)}<span class="section"
							>{sectionOf.get(ingredient.clientId)}</span
						>{/if}
				</li>
			{:else}
				<li class="empty" role="presentation">
					{query ? 'Keine passende Zutat' : 'Alle Zutaten sind zugeordnet'}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.picker {
		position: relative;
	}
	.field {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35em;
		min-height: 2.5rem;
		padding: 0.3rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: text;
	}
	.picker--open .field {
		border-color: var(--color-text-subtle);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.2em;
		padding: 0.15em 0.3em 0.15em 0.65em;
		font-size: 0.85em;
		color: #fff;
		background: #8882a8;
		border-radius: var(--radius-pill);
	}
	.chip button {
		display: flex;
		padding: 0.15em;
		color: inherit;
		background: none;
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}
	.chip button:hover {
		background: rgb(255 255 255 / 0.25);
	}
	.field input {
		flex: 1;
		min-width: 9rem;
		min-height: 0;
		padding: 0.2rem;
		font-size: 0.9375rem;
		border: none;
		outline: none;
	}
	.options {
		position: absolute;
		z-index: 5;
		top: calc(100% + 0.25rem);
		left: 0;
		right: 0;
		max-height: 14rem;
		overflow-y: auto;
		margin: 0;
		padding: 0.25rem;
		list-style: none;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
	}
	.options li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.45rem 0.6rem;
		font-size: 0.9375rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.options li.highlighted {
		background: var(--color-surface-muted);
	}
	.section {
		font-size: 0.8em;
		color: var(--color-text-subtle);
	}
	.options .empty {
		color: var(--color-text-subtle);
		cursor: default;
	}
</style>
