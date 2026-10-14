<script lang="ts">
	import Logo from '$components/Logo.svelte';
	import Search from '$components/Search.svelte';
	import { resolve } from '$app/paths';

	let searching = false;
</script>

<header class="top-bar" class:top-bar--searching={searching}>
	<a class="logo" href={resolve('/', {})}>
		<Logo size="2.25rem" />
		<span>Unser Kochbuch</span>
	</a>
	<Search bind:expanded={searching} />
</header>

<style>
	.top-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		min-height: var(--top-bar-height);
		padding: 0.5rem 1.5rem;
		background: var(--color-surface);
		box-shadow: 0 0 15px rgb(0 0 0 / 0.2);
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.125rem;
		color: var(--color-text);
		text-decoration: none;
		white-space: nowrap;
	}
	@media (max-width: 699px) {
		.top-bar {
			gap: 0.75rem;
			padding: 0.5rem 0.75rem 0.5rem 1rem;
		}
		/* on phones the search takes the whole bar while it is open */
		.top-bar--searching .logo {
			display: none;
		}
	}
</style>
