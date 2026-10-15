<script lang="ts">
	let { name, size = '2rem' }: { name: string; size?: string } = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]!.toUpperCase())
			.join('') || '?'
	);
</script>

<span class="avatar" style="--size: {size}" aria-hidden="true">{initials}</span>

<style>
	/* initials instead of profile pictures, grey because only photos and categories bring color */
	.avatar {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--size);
		height: var(--size);
		font-size: calc(var(--size) * 0.4);
		font-weight: 700;
		line-height: 1;
		color: var(--color-text-muted);
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border);
		border-radius: 50%;
	}
</style>
