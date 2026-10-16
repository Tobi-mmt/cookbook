<script lang="ts">
	import { resolve } from '$app/paths';
	import { OPERATOR, SITE_NAME, SUPPORT_EMAIL } from '#lib/site.js';
</script>

<svelte:head>
	<title>Impressum - {SITE_NAME}</title>
</svelte:head>

<article class="page">
	<h1>Impressum</h1>

	<h2>Anbieter</h2>
	<p>
		{OPERATOR.name}<br />
		{#each OPERATOR.address as line, index (index)}{line}<br />{/each}
	</p>
	<p class="hint">
		Angaben nach § 18 Abs. 1 Medienstaatsvertrag. {SITE_NAME} ist ein privates, nicht kommerzielles Projekt:
		ohne Werbung, ohne Bezahlangebote, ohne Einnahmen.
	</p>

	<h2>Kontakt</h2>
	<p>E-Mail: <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a></p>

	<h2>Inhalte melden</h2>
	<p>
		Rechtswidrige Inhalte meldest du am schnellsten über „Melden“ am Rezept, Kochbuch oder Profil.
		Behörden und alle anderen erreichen uns unter der E-Mail-Adresse oben, auf Deutsch oder
		Englisch.
	</p>

	<h2>Inhalte der Nutzerinnen und Nutzer</h2>
	<p>
		Rezepte, Fotos und Kochbücher stammen von den Personen, die sie einstellen. Wie wir mit
		Meldungen umgehen, steht in den <a href={resolve('/nutzungsbedingungen')}>Nutzungsbedingungen</a
		>.
	</p>
</article>

<style>
	h2 {
		margin-top: 2rem;
	}
	p {
		line-height: 1.6;
	}
	a {
		color: inherit;
	}
</style>
