<script lang="ts">
	import { page } from '$app/state';
	import type { Pagination } from '#lib/server/pagination.js';

	let { pagination }: { pagination: Pagination } = $props();

	const first = $derived((pagination.page - 1) * pagination.size + 1);
	const last = $derived(first + pagination.shown - 1);
	const hasNext = $derived(last < pagination.total);
	const previous = $derived(
		Math.min(pagination.page - 1, Math.ceil(pagination.total / pagination.size))
	);

	const pageHref = (target: number) => {
		const params = [...page.url.searchParams].filter(([key]) => key !== 'seite');
		if (target > 1) params.push(['seite', String(target)]);
		const query = params
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');
		return query ? `?${query}` : page.url.pathname;
	};
</script>

{#if pagination.total}
	<nav class="pagination" aria-label="Seiten">
		<span class="hint">
			{pagination.shown
				? `${first}–${last} von ${pagination.total}`
				: `Keine Einträge auf dieser Seite, insgesamt ${pagination.total}`}
		</span>
		{#if pagination.page > 1 || hasNext}
			<span class="row">
				{#if pagination.page > 1}
					<a class="btn" href={pageHref(previous)}>Vorherige</a>
				{/if}
				{#if hasNext}
					<a class="btn" href={pageHref(pagination.page + 1)}>Nächste</a>
				{/if}
			</span>
		{/if}
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 1rem;
	}
</style>
