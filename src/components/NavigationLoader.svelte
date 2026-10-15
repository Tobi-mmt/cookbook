<script lang="ts">
	import { navigating } from '$app/state';

	let {
		delay,
		color,
		loading = $bindable(false)
	}: {
		/** ms until the bar appears, so that fast navigations do not flicker */
		delay: number;
		color: string;
		/** true while the bar is shown */
		loading?: boolean;
	} = $props();

	$effect(() => {
		if (!navigating.to) {
			loading = false;
			return;
		}
		const timeout = setTimeout(() => (loading = true), delay);
		return () => clearTimeout(timeout);
	});
</script>

{#if loading}
	<div
		class="loading-bar"
		style="--color: {color}"
		role="progressbar"
		aria-label="Seite wird geladen"
	></div>
{/if}

<style>
	.loading-bar {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 20;
		width: 100%;
		height: 3px;
		overflow: hidden;
	}
	.loading-bar::after {
		content: '';
		position: absolute;
		inset: 0;
		width: 40%;
		background: var(--color);
		animation: loading 1.2s ease-in-out infinite;
	}
	@keyframes loading {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(250%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.loading-bar::after {
			width: 100%;
			animation: none;
		}
	}
</style>
