<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';

	let {
		open = $bindable(false),
		title,
		children,
		actions,
		onclose
	}: {
		open?: boolean;
		title: string;
		children: Snippet;
		/** the buttons at the bottom, the main one last */
		actions?: Snippet;
		onclose?: () => void;
	} = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	const close = () => {
		open = false;
		onclose?.();
	};
</script>

<!-- One look for every confirmation and choice: a card above the page, Escape or a click
	next to it closes it -->
<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={close}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
>
	{#if open}
		<div class="card">
			<header>
				<h2>{title}</h2>
				<button
					type="button"
					class="btn btn--quiet btn--icon"
					aria-label="Schließen"
					onclick={close}><X size="1.1em" aria-hidden="true" /></button
				>
			</header>
			<div class="body">{@render children()}</div>
			{#if actions}<footer>{@render actions()}</footer>{/if}
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: min(30rem, calc(100vw - 2rem));
		max-height: calc(100vh - 2rem);
		padding: 0;
		color: var(--color-text);
		background: var(--color-surface);
		border: none;
		border-radius: var(--radius-md);
		box-shadow: 0 12px 40px rgb(0 0 0 / 0.18);
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.3);
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.5rem 1.5rem;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}
	h2 {
		margin: 0.35rem 0 0;
		font-size: 1.25rem;
		font-weight: 400;
	}
	header .btn {
		margin: -0.25rem -0.75rem 0 0;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		line-height: 1.5;
	}
	.body :global(p) {
		margin: 0;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	@media (max-width: 599px) {
		footer {
			flex-direction: column-reverse;
		}
		footer :global(.btn) {
			width: 100%;
		}
	}
</style>
