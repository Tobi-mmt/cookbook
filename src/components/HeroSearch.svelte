<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import { resolve } from '$app/paths';

	let { value = '' }: { value?: string } = $props();
</script>

<form class="hero" method="GET" action={resolve('/suche')} role="search">
	<label class="field">
		<SearchIcon size="1.25em" aria-hidden="true" />
		<input
			type="search"
			name="q"
			{value}
			placeholder="Rezept oder Zutat suchen"
			aria-label="Alle Rezepte durchsuchen"
			minlength="2"
			required
		/>
	</label>
</form>

<style>
	.hero {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 0.5rem;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: 3.25rem;
		padding: 0 1.25rem;
		color: var(--color-text-subtle);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.field:focus-within {
		border-color: var(--color-text-subtle);
	}
	input {
		flex: 1;
		min-width: 0;
		font: inherit;
		font-size: 1.125rem;
		color: var(--color-text);
		background: none;
		border: none;
		outline: none;
	}
	@media (max-width: 599px) {
		.hero {
			padding: 1.5rem 1rem 0.25rem;
		}
	}
</style>
