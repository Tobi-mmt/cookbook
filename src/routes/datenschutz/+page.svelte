<script lang="ts">
	import { SITE_NAME } from '#lib/site.js';

	const US_TRANSFER =
		'Das Unternehmen sitzt in den USA und ist nach dem EU-US Data Privacy Framework zertifiziert, das ein angemessenes Datenschutzniveau sicherstellt.';

	const providers = [
		{
			name: 'Vercel Inc.',
			address: '440 N Barranca Avenue #4133, Covina, CA 91723, USA',
			purpose: 'Betrieb der Anwendung und Speicherung der Rezeptbilder',
			data: 'Jede Anfrage an die Seite mit IP-Adresse und Browserangaben, Inhalte und Bilder',
			location: `Server in Frankfurt, Bilder und Auslieferung auch weltweit. ${US_TRANSFER}`
		},
		{
			name: 'Neon, LLC (Databricks, Inc.)',
			address: '160 Spear Street, Suite 1300, San Francisco, CA 94105, USA',
			purpose: 'Datenbank',
			data: 'Konten, Kochbücher, Rezepte, Meldungen und die anonyme Besucherstatistik',
			location: `Rechenzentrum in Frankfurt. ${US_TRANSFER}`
		},
		{
			name: 'Scaleway SAS',
			address: '8 rue de la Ville l’Evêque, 75008 Paris, Frankreich',
			purpose: 'Versand von E-Mails und Speicherung der verschlüsselten Backups',
			data: 'E-Mail-Adresse und Inhalt der Mails, Backups der Datenbank und der Bilder',
			location: 'Rechenzentren in Paris'
		},
		{
			name: 'Bugsink B.V.',
			address: 'Peter Schathof 41, 3533 HZ Utrecht, Niederlande',
			purpose: 'Fehlerberichte, siehe oben',
			data: 'Fehlermeldung, betroffene Seite, Browser- und Betriebssystemfamilie',
			location: 'Rechenzentren von Hetzner in der EU'
		}
	];
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

	<h2>Fehlerberichte</h2>
	<p>
		Damit wir technische Fehler finden und beheben können, schicken wir bei einem unerwarteten
		Fehler einen Bericht an den Fehler-Tracker Bugsink. Er enthält die Fehlermeldung, die Stelle im
		Programmcode, die betroffene Seite ohne Parameter, den Zeitpunkt, die Version der Anwendung und
		bei Fehlern im Browser die Browser- und Betriebssystemfamilie ohne Version. Fehler im Browser
		gehen zuerst an unseren Server, Bugsink erhält deine IP-Adresse deshalb nicht. Dein Konto und
		deine Inhalte gehören nicht zum Bericht. Rechtsgrundlage ist unser berechtigtes Interesse an
		einer fehlerfreien Anwendung (Art. 6 Abs. 1 lit. f DSGVO). Bugsink löscht die einzelnen Berichte
		nach 60 Tagen. Die Zusammenfassung je Fehler, also Meldung, Anzahl und Zeitraum, bleibt
		gespeichert, bis wir sie löschen.
	</p>

	<h2>Dienstleister</h2>
	<p>Diese Dienstleister verarbeiten Daten in unserem Auftrag:</p>
	<dl class="providers">
		{#each providers as provider (provider.name)}
			<div>
				<dt>{provider.name}</dt>
				<dd>{provider.address}</dd>
				<dd><span>Zweck:</span> {provider.purpose}</dd>
				<dd><span>Daten:</span> {provider.data}</dd>
				<dd><span>Ort:</span> {provider.location}</dd>
			</div>
		{/each}
	</dl>

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
	.providers {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin: 1rem 0 0;
		line-height: 1.6;
	}
	dt {
		font-weight: 700;
	}
	dd {
		margin: 0;
	}
	dd span {
		color: var(--color-text-muted);
	}
</style>
