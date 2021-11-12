<script>
	import { onMount } from 'svelte';
	export let once = false;
	let intersecting = false;

	let container;
	onMount(() => {
		if (typeof IntersectionObserver !== 'undefined') {
			const observer = new IntersectionObserver(
				(entries) => {
					intersecting = entries[0].isIntersecting;
					if (intersecting && once) {
						observer.unobserve(container);
					}
				},
				{
					rootMargin: '400px 0px 400px 0px'
				}
			);
			observer.observe(container);
			return () => observer.unobserve(container);
		}
	});
</script>

<div bind:this={container}>
	{#if intersecting}
		<slot {intersecting} />
	{/if}
</div>
