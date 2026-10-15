<script lang="ts">
	import type { Snippet } from 'svelte';
	import SearchIcon from '@lucide/svelte/icons/search';

	let {
		value = $bindable(''),
		placeholder,
		action,
		onfocus,
		children
	}: {
		value?: string;
		placeholder: string;
		/** with an action the field submits to a search page, otherwise it filters in place */
		action?: string;
		onfocus?: () => void;
		/** e.g. the number of hits below the field */
		children?: Snippet;
	} = $props();
</script>

<!-- the one search field of the lists: home, search page, profiles and cookbooks -->
<div class="search">
	{#if action}
		<form method="GET" {action} role="search">
			<label class="search-field">
				<SearchIcon size="1.25em" aria-hidden="true" />
				<input
					type="search"
					name="q"
					bind:value
					{placeholder}
					aria-label={placeholder}
					minlength="2"
					required
				/>
			</label>
		</form>
	{:else}
		<label class="search-field">
			<SearchIcon size="1.25em" aria-hidden="true" />
			<input type="search" bind:value {placeholder} aria-label={placeholder} {onfocus} />
		</label>
	{/if}
	{@render children?.()}
</div>

<style>
	.search {
		max-width: 36rem;
		margin: 0 auto;
		padding: 1.5rem 1.5rem 0.25rem;
	}
	.search-field {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: 3rem;
		padding: 0 1.25rem;
		color: var(--color-text-subtle);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.search-field:focus-within {
		border-color: var(--color-text-subtle);
	}
	input {
		flex: 1;
		min-width: 0;
		font: inherit;
		/* at least 16px, otherwise iOS zooms into the page */
		font-size: 1.0625rem;
		color: var(--color-text);
		background: none;
		border: none;
		outline: none;
	}
	@media (max-width: 599px) {
		.search {
			padding: 1rem 1rem 0.25rem;
		}
	}
</style>
