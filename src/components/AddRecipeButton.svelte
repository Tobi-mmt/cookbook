<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { resolve } from '$app/paths';

	let { cookbookId }: { cookbookId: string } = $props();
</script>

<a
	class="btn btn--primary add"
	href="{resolve('/neu')}?kochbuch={cookbookId}"
	aria-label="Neues Rezept"
	title="Neues Rezept"><Plus size="1.4em" aria-hidden="true" /></a
>

<style>
	.add {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 15;
		width: 3.5rem;
		height: 3.5rem;
		padding: 0;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
	}
</style>
