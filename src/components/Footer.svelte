<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer>
	<a href={resolve('/ueber')}>Über uns</a>
	<a href={resolve('/rezepte')}>Rezepte nach Kategorie</a>
	<a href={resolve('/kosten')}>Betriebskosten</a>
	<a href={resolve('/nutzungsbedingungen')}>Nutzungsbedingungen</a>
	<a href={resolve('/datenschutz')}>Datenschutz</a>
	<a href={resolve('/impressum')}>Impressum</a>
</footer>

<style>
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1.5rem;
		margin-top: 4rem;
		padding: 1.5rem;
		font-size: 0.8125rem;
		border-top: 1px solid var(--color-border);
	}
	a {
		color: var(--color-text-subtle);
		text-decoration: none;
	}
	a:hover {
		color: var(--color-text-muted);
	}
</style>
