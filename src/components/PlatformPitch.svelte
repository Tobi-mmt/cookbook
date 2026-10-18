<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '#lib/site.js';
</script>

<aside class="pitch" aria-label="Über die {SITE_NAME}">
	<p>
		<strong>Neu hier?</strong> Die {SITE_NAME} ist dein kostenloses Kochbuch im Netz: Speichere deine
		Lieblingsrezepte, importiere Rezepte aus Links und führe gemeinsame Kochbücher mit Familie und Freunden.
		Ohne Werbung, ohne Abo.
	</p>
	<div class="actions">
		<a class="btn btn--primary" href={resolve('/anmelden')}>Kostenlos Kochbuch anlegen</a>
		<a class="btn btn--quiet" href={resolve('/ueber')}>So funktioniert’s</a>
	</div>
</aside>

<style>
	.pitch {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.5rem;
		max-width: 46rem;
		margin: 0 auto 1.5rem;
		padding: 1rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	:global(html.signed-in) .pitch {
		display: none;
	}
	p {
		flex: 1 1 22rem;
		margin: 0;
		line-height: 1.55;
		color: var(--color-text-muted);
	}
	strong {
		color: var(--color-text);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	@media (max-width: 599px) {
		.pitch {
			margin: 0 1rem 1.25rem;
		}
	}
</style>
