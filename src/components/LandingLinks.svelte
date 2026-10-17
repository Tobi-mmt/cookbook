<script lang="ts">
	import { landingPath, type Landing } from '#lib/landings.js';

	let { landings }: { landings: Landing[] } = $props();
</script>

<ul class="landings">
	{#each landings as landing (landing.slug)}
		<li>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static paths -->
			<a href={landingPath(landing.slug)}>{landing.title} <span>{landing.count}</span></a>
		</li>
	{/each}
</ul>

<style>
	.landings {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.35rem 0.9rem;
		font-size: 0.9375rem;
		color: var(--color-text);
		text-decoration: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	a:hover {
		border-color: var(--color-text-subtle);
	}
	span {
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
	}
</style>
