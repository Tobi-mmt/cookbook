<script lang="ts" module>
	export type CookbookTarget = { cookbookId: string } | { newCookbookName: string };
</script>

<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	let {
		question,
		cookbooks,
		busy,
		onpick,
		oncancel
	}: {
		question: string;
		cookbooks: { id: string; name: string }[];
		busy: boolean;
		onpick: (target: CookbookTarget) => void;
		oncancel: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let creating = $state(!cookbooks.length);
	let name = $state('');
</script>

<div class="picker" role="group" aria-label={question}>
	<p class="question">{question}</p>
	<div class="row">
		{#each cookbooks as cookbook (cookbook.id)}
			<button
				type="button"
				class="btn"
				disabled={busy}
				onclick={() => onpick({ cookbookId: cookbook.id })}>{cookbook.name}</button
			>
		{/each}
		{#if !creating}
			<button type="button" class="btn btn--quiet" onclick={() => (creating = true)}>
				<Plus size="1em" aria-hidden="true" /> Neues Kochbuch
			</button>
		{/if}
	</div>
	{#if creating}
		<form
			class="row"
			onsubmit={(event) => {
				event.preventDefault();
				if (name.trim()) onpick({ newCookbookName: name.trim() });
			}}
		>
			<input
				class="input"
				bind:value={name}
				placeholder="Name des neuen Kochbuchs, z. B. Grillen"
				aria-label="Name des neuen Kochbuchs"
				maxlength="80"
				required
			/>
			<button type="submit" class="btn btn--primary" disabled={busy || !name.trim()}>Anlegen</button
			>
		</form>
	{/if}
	<div class="row">
		<button type="button" class="btn btn--quiet" onclick={oncancel}>Abbrechen</button>
	</div>
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem 1.25rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-md);
	}
	.question {
		margin: 0;
		font-size: 0.9375rem;
	}
	form .input {
		flex: 1;
		min-width: 12rem;
	}
</style>
