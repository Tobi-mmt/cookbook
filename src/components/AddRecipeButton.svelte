<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { resolve } from '$app/paths';

	let { cookbookId }: { cookbookId: string } = $props();
	let open = $state(false);
</script>

<div class="add">
	{#if open}
		<div class="choices">
			<a class="btn" href="{resolve('/neu')}?kochbuch={cookbookId}">Neues Rezept</a>
			<a class="btn" href="{resolve('/import')}?kochbuch={cookbookId}">Aus Link importieren</a>
		</div>
	{/if}
	<button
		type="button"
		class="btn btn--primary plus"
		aria-expanded={open}
		aria-label="Rezept hinzufügen"
		onclick={() => (open = !open)}><Plus size="1.4em" aria-hidden="true" /></button
	>
</div>

<style>
	.add {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 15;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}
	.choices {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}
	.choices .btn {
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
	}
	.plus {
		width: 3.5rem;
		height: 3.5rem;
		padding: 0;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
	}
</style>
