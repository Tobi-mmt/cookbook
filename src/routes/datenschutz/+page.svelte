<script lang="ts">
	import { SITE_NAME } from '#lib/site.js';
</script>

<svelte:head>
	<title>Datenschutz - {SITE_NAME}</title>
</svelte:head>

<article class="page">
	<h1>Datenschutzerklärung</h1>
	<p class="message">Entwurf, wird vor dem Start rechtlich geprüft.</p>

	<h2>Verantwortlich</h2>
	<p>Siehe <a href="/impressum">Impressum</a>.</p>

	<h2>Ohne Konto</h2>
	<p>
		Wir setzen keine Cookies und verwenden keine Werbe- oder Analysedienste anderer. Seitenaufrufe
		zählen wir ohne Cookies: Aus einem täglich wechselnden Zufallswert, deiner IP-Adresse und deinem
		Browser bilden wir einen Hash. Die IP-Adresse speichern wir nicht, und der Zufallswert wird nach
		einem Tag gelöscht. Danach lässt sich der Hash niemandem mehr zuordnen. Gespeichert werden nur
		die aufgerufene Seite, der Tag sowie Browser- und Betriebssystemfamilie ohne Version. Die
		Rohdaten löschen wir nach 30 Monaten, die Summen pro Rezept und Tag behalten wir.
	</p>

	<h2>Mit Konto</h2>
	<p>
		Für dein Konto speichern wir deine E-Mail-Adresse, deinen Namen, deinen Benutzernamen und deine
		Passkeys. Zum Anmelden setzen wir ein technisch notwendiges Sitzungs-Cookie. Deine Rezepte und
		Kochbücher sind öffentlich. Du kannst deine Daten jederzeit unter „Konto“ herunterladen und dein
		Konto löschen. Nach der Löschung bleiben deine Daten bis zu 6 Monate in unseren verschlüsselten
		Backups und werden nach einer Wiederherstellung erneut gelöscht.
	</p>

	<h2>Meldungen</h2>
	<p>
		Wenn du einen Inhalt meldest, speichern wir die Meldung, auf Wunsch deine E-Mail-Adresse und
		einen Hash deiner IP-Adresse, um Missbrauch zu begrenzen.
	</p>

	<h2>Dienstleister</h2>
	<p>
		Die Anwendung läuft bei Vercel (Hosting und Bilder), die Datenbank bei Neon in Frankfurt,
		E-Mails verschicken wir über Scaleway in Paris, Backups liegen verschlüsselt bei Scaleway. Mit
		allen besteht ein Vertrag zur Auftragsverarbeitung.
	</p>

	<h2>Deine Rechte</h2>
	<p>
		Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
		Datenübertragbarkeit und Widerspruch sowie auf Beschwerde bei einer Aufsichtsbehörde.
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
