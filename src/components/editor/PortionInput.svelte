<script lang="ts">
	import { RECIPE_LIMITS } from '#lib/recipeInput.js';
	import { DEFAULT_PORTION_UNIT, completePortionUnit, portionUnitFor } from '#lib/portionUnit.js';

	let { portion = $bindable(), unit = $bindable() }: { portion: number; unit: string | undefined } =
		$props();

	let dismissed = $state(false);
	let unitInput = $state<HTMLInputElement>();

	const suggestion = $derived(dismissed ? undefined : completePortionUnit(unit ?? '', portion));
	// the rest after what was typed, shown in grey behind the cursor
	const rest = $derived(suggestion?.slice((unit ?? '').length));

	const accept = () => {
		if (!suggestion) return false;
		unit = suggestion;
		return true;
	};

	const atEnd = (input: HTMLInputElement) =>
		input.selectionStart === input.value.length && input.selectionEnd === input.value.length;

	const onkeydown = (event: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
		if (!suggestion) return;
		if (event.key === 'Enter' || (event.key === 'ArrowRight' && atEnd(event.currentTarget))) {
			if (accept()) event.preventDefault();
		} else if (event.key === 'Tab' && !event.shiftKey) {
			// accepts and moves on to the next field
			accept();
		} else if (event.key === 'Escape') {
			dismissed = true;
			event.preventDefault();
		}
	};

	// "1 Portion" but "2 Portionen", other units stay as written
	const fitToCount = () => {
		if (unit?.trim()) unit = portionUnitFor(portion, unit);
	};
</script>

<div class="field">
	<span id="portion-label">Ergibt</span>
	<div class="yield">
		<input
			class="count"
			type="number"
			min="1"
			max={RECIPE_LIMITS.portion}
			step="1"
			required
			aria-labelledby="portion-label"
			bind:value={portion}
			oninput={fitToCount}
		/>
		<span class="unit">
			<input
				bind:this={unitInput}
				type="text"
				aria-label="Einheit, z. B. Portionen, Muffins oder Kuchen"
				aria-autocomplete="inline"
				autocomplete="off"
				autocapitalize="sentences"
				spellcheck="false"
				enterkeyhint="done"
				maxlength={RECIPE_LIMITS.portionUnit}
				placeholder={portionUnitFor(portion, DEFAULT_PORTION_UNIT)}
				bind:value={unit}
				oninput={() => (dismissed = false)}
				onfocus={(event) => event.currentTarget.select()}
				onblur={fitToCount}
				{onkeydown}
			/>
			{#if rest}
				<!-- the keyboard accepts with Tab, Enter or the right arrow, touch with a tap here -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="ghost" aria-hidden="true"
					><span class="typed">{unit}</span><span
						class="rest"
						onpointerdown={(event) => {
							event.preventDefault();
							accept();
							unitInput?.focus();
						}}>{rest}</span
					></span
				>
			{/if}
		</span>
	</div>
</div>

<style>
	/* looks like the other fields of the editor, the count and its unit read like "35 Muffins" */
	.yield {
		display: flex;
		align-items: center;
		gap: 0.3em;
		min-height: 2.5rem;
		padding: 0 0.7rem;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: text;
	}
	.yield:focus-within {
		border-color: var(--color-text-subtle);
	}
	/* specific enough to win over the styles of all inputs in the editor */
	.field .yield .count,
	.field .yield .unit input {
		min-width: 0;
		min-height: 0;
		padding: 0.4rem 0;
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		border-radius: 0;
		outline: none;
	}
	.field .yield .count {
		flex: none;
		/* as wide as the number where supported, room for two digits elsewhere */
		width: 2ch;
		min-width: 1ch;
		font-variant-numeric: tabular-nums;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	@supports (field-sizing: content) {
		.field .yield .count {
			width: auto;
			field-sizing: content;
		}
	}
	.count::-webkit-inner-spin-button,
	.count::-webkit-outer-spin-button {
		margin: 0;
		-webkit-appearance: none;
	}
	.unit {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
	}
	.field .yield .unit input {
		width: 100%;
	}
	.unit input::placeholder {
		color: var(--color-text-subtle);
	}
	.ghost {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		white-space: pre;
		overflow: hidden;
		pointer-events: none;
	}
	.typed {
		visibility: hidden;
	}
	.rest {
		color: var(--color-text-subtle);
		pointer-events: auto;
		cursor: pointer;
	}
</style>
