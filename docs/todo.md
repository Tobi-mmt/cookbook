# Noch zu erledigen

Was vor dem Start fehlt und nur du erledigen kannst. Der Code ist fertig, siehe `docs/spec-mehrbenutzer.md`.

## 1. Domain und Name

- [ ] Namen und Domain festlegen, Domain in Vercel hinzufügen.
- [ ] Namen in `src/lib/site.ts` (`SITE_NAME`) eintragen.
- [ ] GitHub-Variable `SITE_URL` auf `https://{domain}` setzen (Warm-up nach Deployments).
- [ ] Weiterleitung der alten Domain in `vercel.json` ergänzen, erst wenn die neue Domain läuft:
  ```json
  "redirects": [
  	{
  		"source": "/",
  		"has": [{ "type": "host", "value": "kochbuch.monaundtobi.de" }],
  		"destination": "https://{domain}/@tobi/unser-kochbuch",
  		"permanent": true
  	},
  	{
  		"source": "/:path*",
  		"has": [{ "type": "host", "value": "kochbuch.monaundtobi.de" }],
  		"destination": "https://{domain}/:path*",
  		"permanent": true
  	}
  ]
  ```
- [ ] Passkeys gelten nur für die Domain, auf der sie angelegt wurden. Nach dem Umzug neu anlegen.

## 2. E-Mail (Scaleway Transactional Email)

- [ ] In Scaleway (Region `fr-par`) die Domain `mail.{domain}` anlegen.
- [ ] Die DNS-Einträge für SPF und DKIM von Scaleway setzen, dazu DMARC: `_dmarc.mail.{domain}` mit `v=DMARC1; p=none; rua=mailto:support@{domain}`. Nach einigen Wochen ohne Probleme auf `p=quarantine`.
- [ ] API-Key nur mit Rechten für Transactional Email anlegen.
- [ ] In Vercel setzen: `SCW_SECRET_KEY`, `SCW_PROJECT_ID`, `MAIL_FROM=Kochbuch <hallo@mail.{domain}>`, `MAIL_REPLY_TO=support@{domain}`.
- [ ] Postfach `support@{domain}` einrichten.
- [ ] Webhook für Bounces und Spam-Beschwerden über Scaleway Topics and Events auf `https://{domain}/api/mail/webhook?secret={MAIL_WEBHOOK_SECRET}`, `MAIL_WEBHOOK_SECRET` in Vercel setzen. Mit einer Test-Mail prüfen, ob die Adresse in `mail_suppressions` landet. Das Format der Events war beim Bauen nicht prüfbar.

## 3. Vercel

- [ ] `BETTER_AUTH_SECRET` setzen (`openssl rand -base64 32`).
- [ ] Prüfen, dass `ISR_BYPASS_TOKEN` und `CRON_SECRET` gesetzt sind. Die alten Variablen `ADMIN_PASSWORD_HASH` und `SESSION_SECRET` löschen.

## 4. Konten nach dem ersten Deployment

- [ ] Die Migration legt `tobi` (Admin) und `mona` mit Platzhalter-Adressen an. In der Neon-Konsole die echten Adressen eintragen:
  ```sql
  update users set email = '…' where username = 'tobi';
  update users set email = '…' where username = 'mona';
  ```
- [ ] Tobias: per Link anmelden, unter „Konto“ einen Passkey anlegen, dann mit dem Passkey neu anmelden. Erst danach öffnet sich `/admin`.

## 5. Backups

- [ ] Bucket in Scaleway Object Storage (`fr-par`) anlegen, getrennt vom Rest.
- [ ] Lifecycle-Regeln: `database/daily/` nach 30 Tagen, `database/monthly/` nach 180 Tagen, `images/` nach 28 Tagen löschen. Optional Object Lock.
- [ ] API-Key, der nur Objekte schreiben darf (kein Lesen, kein Löschen).
- [ ] In Neon eine Rolle nur mit Leserechten anlegen.
- [ ] `age-keygen -o key.txt`: privaten Schlüssel in den Passwort-Manager und ausgedruckt sicher verwahren, `key.txt` danach löschen.
- [ ] GitHub-Secrets: `BACKUP_DATABASE_URL` (Leserolle), `SCW_BACKUP_ACCESS_KEY`, `SCW_BACKUP_SECRET_KEY`, `BLOB_READ_WRITE_TOKEN`. GitHub-Variablen: `BACKUP_BUCKET`, `AGE_PUBLIC_KEY`, `PG_MAJOR` (Postgres-Version von Neon, Standard 17).
- [ ] Workflow „Backup“ einmal von Hand starten, auch mit Bildern.
- [ ] Einmal ein Backup nach README entschlüsseln und in einen Neon-Branch einspielen. Der nächtliche Test spielt den Dump vor dem Verschlüsseln ein, das Entschlüsseln prüft er nicht, weil der private Schlüssel nicht in GitHub liegt.

## 6. Neon

- [ ] Region prüfen: `aws-eu-central-1` (Frankfurt).
- [ ] CU-Stunden ab und zu in der Neon-Konsole ansehen. Für den Speicher warnt der nächtliche Job ab 80 %, für die CU-Stunden nicht.

## 7. Recht

- [ ] Nutzungsbedingungen, Datenschutzerklärung und Impressum (`/nutzungsbedingungen`, `/datenschutz`, `/impressum`) rechtlich prüfen lassen, Anbieter und Kontaktstelle nach DSA im Impressum ergänzen.
- [ ] Bildregel beim Import (nur CC0, CC BY, CC BY-SA) prüfen lassen.
- [ ] Auftragsverarbeitungsverträge mit Vercel, Neon und Scaleway abschließen.

## 8. Bestand

- [ ] Rezepte, deren Texte wörtlich von anderen Seiten stammen, in eigenen Worten umformulieren.
- [ ] Kategorien nachsortieren: Die Migration hat „Herzhaft“ zu „Hauptgericht“ gemacht. Suppen, Soßen, Spätzle, Energiekugeln usw. in die neuen Kategorien verschieben.

## Nicht umgesetzt

- Phase 4 der Spec (optional): „Neu seit deinem Besuch“, App zum Installieren mit „Teilen an Kochbuch“, Anzeige „Mona bearbeitet gerade“. Der QR-Code auf dem Profil ist umgesetzt.
- Phase 5 (Finanzierung): erst nach allen anderen Phasen und mit Blick auf die Besucherzahlen.
