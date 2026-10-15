<script lang="ts" module>
	export type CookbookTarget = { cookbookId: string } | { newCookbookName: string };
</script>

<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Plus from '@lucide/svelte/icons/plus';

	let {
		cookbooks,
		busy,
		onpick
	}: {
		cookbooks: { id: string; name: string }[];
		busy: boolean;
		onpick: (target: CookbookTarget) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let creating = $state(!cookbooks.length);
	let name = $state('');
</script>

<ul class="choices">
	{#each cookbooks as cookbook (cookbook.id)}
		<li>
			<button
				type="button"
				class="choice"
				disabled={busy}
				onclick={() => onpick({ cookbookId: cookbook.id })}
			>
				<BookOpen size="1.1em" aria-hidden="true" />
				{cookbook.name}
			</button>
		</li>
	{/each}
	<li>
		{#if creating}
			<form
				class="new"
				onsubmit={(event) => {
					event.preventDefault();
					if (name.trim()) onpick({ newCookbookName: name.trim() });
				}}
			>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="input"
					bind:value={name}
					placeholder="Name, z. B. Grillen"
					aria-label="Name des neuen Kochbuchs"
					maxlength="80"
					required
					autofocus
				/>
				<button type="submit" class="btn btn--primary" disabled={busy || !name.trim()}
					>Anlegen</button
				>
			</form>
		{:else}
			<button type="button" class="choice choice--new" onclick={() => (creating = true)}>
				<Plus size="1.1em" aria-hidden="true" /> Neues Kochbuch
			</button>
		{/if}
	</li>
</ul>

<style>
	.choices {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.choices li {
		border-bottom: 1px solid var(--color-border);
	}
	.choice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 3rem;
		padding: 0.5rem 0.25rem;
		font: inherit;
		text-align: left;
		color: var(--color-text);
		background: none;
		border: none;
		cursor: pointer;
	}
	.choice:hover:not(:disabled) {
		background: var(--color-surface-muted);
	}
	.choice:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.choice--new {
		color: var(--color-text-muted);
	}
	.new {
		display: flex;
		gap: 0.5rem;
		padding: 0.6rem 0;
	}
	.new .input {
		flex: 1;
		min-width: 0;
	}
</style>
