<script lang="ts">
	import Logo from '#components/Logo.svelte';
	import Search from '#components/Search.svelte';
	import UserMenu from '#components/UserMenu.svelte';
	import { resolve } from '$app/paths';

	let searching = false;
</script>

<header class="top-bar" class:top-bar--searching={searching}>
	<div class="top-bar-inner">
		<a class="logo" href={resolve('/')}>
			<Logo size="2.25rem" />
			<span>Unser Kochbuch</span>
		</a>
		<div class="actions">
			<Search bind:expanded={searching} />
			<UserMenu />
		</div>
	</div>
</header>

<style>
	.top-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 0.5rem 1.5rem;
		background: var(--color-surface);
		box-shadow: 0 0 15px rgb(0 0 0 / 0.2);
	}
	/* the bar spans the whole width, its content as wide as the recipe content */
	.top-bar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		max-width: 1250px;
		min-height: calc(var(--top-bar-height) - 1rem);
		margin: 0 auto;
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
	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}
	@media (max-width: 699px) {
		.top-bar {
			padding: 0.5rem 0.75rem 0.5rem 1rem;
		}
		.top-bar-inner {
			gap: 0.75rem;
		}
		/* on phones the search takes the whole bar while it is open */
		.top-bar--searching .logo {
			display: none;
		}
	}
</style>
