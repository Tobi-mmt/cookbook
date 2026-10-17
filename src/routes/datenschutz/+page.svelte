<script lang="ts">
	import Email from '#components/Email.svelte';
	import { resolve } from '$app/paths';
	import { OPERATOR, SITE_NAME } from '#lib/site.js';

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
			data: 'E-Mail-Adresse und Inhalt der Mails, verschlüsselte Backups der Datenbank und der Bilder',
			location: 'Rechenzentren in Paris'
		},
		{
			name: 'GitHub, Inc.',
			address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA',
			purpose: 'Erstellen der nächtlichen Backups',
			data: 'Die Datenbank und die Bilder, nur während des Backups und vor dem Verschlüsseln',
			location: `Server in den USA, die Daten werden nach jedem Lauf gelöscht. ${US_TRANSFER}`
		},
		{
			name: 'Bugsink B.V.',
			address: 'Peter Schathof 41, 3533 HZ Utrecht, Niederlande',
			purpose: 'Fehlerberichte',
			data: 'Fehlermeldung, betroffene Seite, Browser- und Betriebssystemfamilie',
			location: 'Rechenzentren von Hetzner in der EU'
		}
	];

	const retention = [
		['Anmelde-Link', '15 Minuten'],
		['Anmeldung (Sitzung)', 'bis zur Abmeldung, höchstens 30 Tage'],
		['Konto', 'bis du es löschst, die Löschung wird nach 7 Tagen ausgeführt'],
		['Alter Benutzername', '6 Monate für dich reserviert'],
		['Gelöschte Rezepte und Kochbücher', '30 Tage im Papierkorb'],
		['Protokolle der Server bei Vercel', 'höchstens 1 Tag'],
		['Zähler gegen Missbrauch', 'bis das Zeitfenster abläuft, höchstens 1 Tag'],
		['Versandprotokoll der E-Mails', '90 Tage'],
		['Fehlerberichte', '60 Tage'],
		['Besucherstatistik', 'Rohdaten 30 Monate, danach nur Summen pro Rezept und Tag'],
		['Backups', 'bis zu 12 Monate']
	];
</script>

<svelte:head>
	<title>Datenschutz - {SITE_NAME}</title>
</svelte:head>

<article class="page">
	<h1>Datenschutzerklärung</h1>

	<h2>Das Wichtigste in Kürze</h2>
	<ul>
		<li>Keine Werbung, kein Tracking durch andere, keine Cookies ohne Konto.</li>
		<li>Wir speichern nur, was für {SITE_NAME} nötig ist, und verkaufen keine Daten.</li>
		<li>Rezepte, Kochbücher und Profile sind öffentlich.</li>
		<li>Alle Dienstleister stehen unten mit Zweck, Daten und Ort.</li>
	</ul>

	<h2>Verantwortlich</h2>
	<p>
		{OPERATOR.name}<br />
		{#each OPERATOR.address as line, index (index)}{line}<br />{/each}
		E-Mail: <Email />
	</p>

	<h2>Beim Aufruf der Seite</h2>
	<p>
		Jede Anfrage geht an die Server von Vercel. Dabei fallen deine IP-Adresse, die aufgerufene
		Adresse, der Zeitpunkt und deine Browserangaben an. Vercel braucht sie, um die Seite
		auszuliefern und vor Angriffen zu schützen, und hält sie nur kurz in Protokollen vor.
	</p>
	<p>
		Seitenaufrufe zählen wir selbst und ohne Cookies: Aus einem täglich wechselnden Zufallswert,
		deiner IP-Adresse und deinem Browser bilden wir einen Hash. Die IP-Adresse speichern wir nicht,
		und der Zufallswert wird nach einem Tag gelöscht. Danach lässt sich der Hash niemandem mehr
		zuordnen. Gespeichert werden nur die aufgerufene Seite, der Tag, Browser- und
		Betriebssystemfamilie ohne Version und beim ersten Aufruf der Domainname der Seite, über deren
		Link du gekommen bist, ohne die genaue Adresse.
	</p>
	<p>
		Schriften, Bilder und Programmcode kommen von unserem eigenen Server. Die Sicherheitsabfrage
		beim Anmelden und Melden ist eine kleine Rechenaufgabe, die dein Browser selbst löst, ohne
		fremden Dienst.
	</p>
	<p class="basis">
		Rechtsgrundlage: berechtigtes Interesse an einem sicheren, funktionierenden Angebot, Art. 6 Abs.
		1 lit. f DSGVO.
	</p>

	<h2>Cookies und Speicher im Browser</h2>
	<p>
		Ohne Konto setzen wir keine Cookies. Nach dem Anmelden setzen wir ein Sitzungs-Cookie, das dich
		angemeldet hält. Wählst du „angemeldet bleiben“ ab, kommt ein zweites dazu, damit die Sitzung
		mit dem Browser endet. Im Speicher deines Browsers (localStorage) merken wir uns, ob du
		angemeldet bist, und ungespeicherte Entwürfe beim Bearbeiten eines Rezepts. Diese Daten
		verlassen deinen Browser nicht.
	</p>
	<p class="basis">Rechtsgrundlage: technisch notwendig, § 25 Abs. 2 Nr. 2 TDDDG.</p>

	<h2>Konto</h2>
	<p>
		Für dein Konto speichern wir deine E-Mail-Adresse, deinen Namen, deinen Benutzernamen, dass du
		mindestens 16 bist und den Nutzungsbedingungen zugestimmt hast, sowie deine Passkeys. Von einem
		Passkey speichern wir nur den öffentlichen Schlüssel, der geheime bleibt auf deinem Gerät. Zu
		einer Anmeldung speichern wir weder IP-Adresse noch Browser.
	</p>
	<p>
		Unter „Konto“ kannst du alle deine Daten herunterladen und dein Konto löschen. Nach 7 Tagen
		werden Konto, Profil und die Kochbücher gelöscht, die du allein führst. Gemeinsame Kochbücher
		gehen an die nächste Person über, deine Rezepte darin bleiben ohne deinen Namen. Wir behalten
		nur die interne Kennung des gelöschten Kontos, damit es nach einer Wiederherstellung aus einem
		Backup erneut gelöscht wird.
	</p>
	<p class="basis">Rechtsgrundlage: Nutzungsvertrag, Art. 6 Abs. 1 lit. b DSGVO.</p>

	<h2>Rezepte und Kochbücher</h2>
	<p>
		Alles, was du einstellst, ist öffentlich und steht unter
		<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de">CC BY-SA 4.0</a>, mit deinem
		Namen als Urheber. Frühere Versionen eines Rezepts bleiben gespeichert, solange es das Rezept
		gibt. Gelöschtes liegt 30 Tage im Papierkorb. Importierst du ein Rezept aus einem Link, ruft
		unser Server die Seite ab, die fremde Seite sieht also nicht dich.
	</p>
	<p class="basis">Rechtsgrundlage: Nutzungsvertrag, Art. 6 Abs. 1 lit. b DSGVO.</p>

	<h2>E-Mails</h2>
	<p>
		Wir schicken nur Mails, die zum Betrieb gehören: Anmelde-Links, Einladungen, Bestätigungen und
		Entscheidungen der Moderation. Kein Newsletter, keine Werbung, kein Tracking in Mails.
		Empfänger, Art und Zeitpunkt protokollieren wir 90 Tage. Kommt eine Mail nicht an oder wird sie
		als Spam gemeldet, schicken wir an diese Adresse keine weiteren Mails.
	</p>
	<p class="basis">Rechtsgrundlage: Nutzungsvertrag, Art. 6 Abs. 1 lit. b DSGVO.</p>

	<h2>Schutz vor Missbrauch, Meldungen und Moderation</h2>
	<p>
		Um Anmeldungen, Meldungen und Importe zu begrenzen, zählen wir Versuche mit einem Hash deiner
		IP-Adresse, nie mit der Adresse selbst. Wenn du einen Inhalt meldest, speichern wir die Meldung,
		auf Wunsch deine E-Mail-Adresse und einen Hash deiner IP-Adresse. Meldungen, Entscheidungen und
		Widersprüche bewahren wir auf, damit Entscheidungen nachvollziehbar bleiben und wiederholter
		Missbrauch erkennbar ist.
	</p>
	<p class="basis">
		Rechtsgrundlage: berechtigtes Interesse an einem sicheren Angebot, Art. 6 Abs. 1 lit. f DSGVO.
	</p>

	<h2>Fehlerberichte</h2>
	<p>
		Bei einem unerwarteten Fehler schicken wir einen Bericht an Bugsink: die Fehlermeldung, die
		Stelle im Programmcode, die betroffene Seite ohne Parameter, den Zeitpunkt, die Version der
		Anwendung und bei Fehlern im Browser die Browser- und Betriebssystemfamilie ohne Version. Fehler
		im Browser gehen zuerst an unseren Server, Bugsink erhält deine IP-Adresse deshalb nicht. Dein
		Konto und deine Inhalte gehören nicht zum Bericht.
	</p>
	<p class="basis">
		Rechtsgrundlage: berechtigtes Interesse an einer fehlerfreien Anwendung, Art. 6 Abs. 1 lit. f
		DSGVO.
	</p>

	<h2>Backups</h2>
	<p>
		Jede Nacht sichern wir die Datenbank, jede Woche die Bilder. Die Sicherung läuft bei GitHub,
		wird dort verschlüsselt und dann bei Scaleway abgelegt. Den Schlüssel haben nur wir. Backups
		bewahren wir bis zu 12 Monate auf, so lange können gelöschte Daten darin noch enthalten sein.
		Spielen wir ein Backup ein, löschen wir gelöschte Konten sofort erneut.
	</p>
	<p class="basis">
		Rechtsgrundlage: berechtigtes Interesse am Schutz vor Datenverlust, Art. 6 Abs. 1 lit. f DSGVO.
	</p>

	<h2>Dienstleister</h2>
	<p>Diese Dienstleister verarbeiten Daten in unserem Auftrag.</p>
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

	<h2>Speicherdauer</h2>
	<div class="table-scroll">
		<table>
			<tbody>
				{#each retention as [what, duration] (what)}
					<tr><th scope="row">{what}</th><td>{duration}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h2>Deine Rechte</h2>
	<p>
		Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
		Datenübertragbarkeit und Widerspruch gegen Verarbeitungen aus berechtigtem Interesse. Vieles
		kannst du selbst unter „Konto“ erledigen, sonst schreib an
		<Email />. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum
		Beispiel der deines Bundeslands.
	</p>
	<p>
		Für die Nutzung gelten die <a href={resolve('/nutzungsbedingungen')}>Nutzungsbedingungen</a>.
	</p>
</article>

<style>
	h2 {
		margin-top: 2rem;
	}
	p,
	ul {
		line-height: 1.6;
	}
	ul {
		padding-left: 1.25rem;
	}
	a {
		color: inherit;
	}
	.basis {
		font-size: 0.875rem;
		color: var(--color-text-muted);
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
	.table-scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		line-height: 1.5;
	}
	th,
	td {
		padding: 0.5rem 0.75rem 0.5rem 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-border);
	}
	th {
		font-weight: 400;
		color: var(--color-text-muted);
	}
</style>
