<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME, SUPPORT_EMAIL } from '#lib/site.js';
</script>

<svelte:head>
	<title>Nutzungsbedingungen - {SITE_NAME}</title>
</svelte:head>

<article class="page">
	<h1>Nutzungsbedingungen</h1>

	<h2>Worum es geht</h2>
	<p>
		{SITE_NAME} ist eine Plattform für Kochbücher. Du kannst Rezepte anlegen, aus Links importieren, mit
		anderen gemeinsam bearbeiten und Rezepte anderer in dein eigenes Kochbuch übernehmen. Die Nutzung
		ist kostenlos. Anbieter ist die im <a href={resolve('/impressum')}>Impressum</a> genannte Person,
		ein privates, nicht kommerzielles Projekt.
	</p>

	<h2>Konto</h2>
	<p>
		Ein Konto gibt es ab 16 Jahren. Du meldest dich per Link an deine E-Mail-Adresse oder mit einem
		Passkey an. Halte deine E-Mail-Adresse aktuell und gib deinen Zugang nicht weiter.
	</p>

	<h2>Alles ist öffentlich</h2>
	<p>
		Alle Rezepte, Kochbücher und Profile sind für alle sichtbar, auch ohne Konto. Es gibt keine
		privaten Inhalte. Stell nichts ein, was nicht öffentlich sein soll.
	</p>

	<h2>Lizenz deiner Inhalte</h2>
	<p>
		Alles, was du einstellst, also Rezepttexte und eigene Fotos, veröffentlichst du unter der Lizenz
		<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de">CC BY-SA 4.0</a>. Jeder darf
		deine Inhalte mit Namensnennung weiterverwenden und anpassen, auch außerhalb dieser Plattform,
		wenn die Bearbeitung unter derselben Lizenz steht. Die Lizenz lässt sich nicht widerrufen: Wenn
		du ein Rezept löschst, bleiben Kopien bestehen, die andere schon übernommen haben. Wenn du dein
		Konto löschst, wird dein Name aus diesen Kopien entfernt.
	</p>

	<h2>Was du einstellen darfst</h2>
	<p>
		Du darfst nur Inhalte einstellen, an denen du die nötigen Rechte hast. Fotos anderer Seiten
		übernimmst du nur, wenn sie unter CC0, CC BY oder CC BY-SA stehen. Formuliere fremde Rezepte in
		eigenen Worten und gib die Quelle an. Nicht erlaubt sind rechtswidrige, anstößige,
		gewaltverherrlichende oder beleidigende Inhalte, Spam, Werbung und persönliche Daten anderer.
	</p>

	<h2>Melden und Moderation</h2>
	<p>
		Jeder kann Inhalte melden. Wir prüfen Meldungen und können Inhalte ausblenden oder löschen,
		Konten verwarnen oder sperren. Du erfährst per E-Mail, was wir warum getan haben, und kannst
		einmal Widerspruch einlegen. Meldungen allein blenden nichts aus.
	</p>

	<h2>Haftung und Verfügbarkeit</h2>
	<p>
		Rezepte stammen von den Personen, die sie einstellen. Prüfe Angaben zu Mengen, Garzeiten und
		Unverträglichkeiten selbst. Wir bemühen uns um einen zuverlässigen Betrieb, können ihn aber
		nicht garantieren. Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für
		Schäden an Leben, Körper und Gesundheit, im Übrigen nur, soweit das Gesetz es zwingend vorsieht.
	</p>

	<h2>Ende der Nutzung</h2>
	<p>
		Du kannst dein Konto jederzeit unter „Konto“ löschen. Wir können Konten sperren oder löschen,
		wenn jemand gegen diese Bedingungen verstößt. Sollten wir {SITE_NAME} einstellen, kündigen wir das
		mindestens 4 Wochen vorher per E-Mail an, damit du deine Daten herunterladen kannst.
	</p>

	<h2>Änderungen</h2>
	<p>
		Ändern sich diese Bedingungen, informieren wir dich mindestens 4 Wochen vorher per E-Mail. Was
		mit deinen Daten geschieht, steht in der <a href={resolve('/datenschutz')}
			>Datenschutzerklärung</a
		>. Fragen beantworten wir unter <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>. Es gilt
		deutsches Recht.
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
