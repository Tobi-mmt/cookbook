# Noch zu erledigen

Was vor dem Start fehlt und nur du erledigen kannst. Der Code ist fertig, siehe `docs/spec-mehrbenutzer.md`.

## 1. Domain und Name

- [x] Name und Domain: Kochbuchbande, `kochbuchbande.de`.
- [x] `kochbuchbande.de` (und `www.kochbuchbande.de` als Weiterleitung) in Vercel hinzufügen.
- [x] GitHub-Variable `SITE_URL` auf `https://kochbuchbande.de` setzen (Warm-up nach Deployments).
- [ ] Weiterleitung der alten Domain in `vercel.json` ergänzen, erst wenn die neue Domain läuft:
  ```json
  "redirects": [
  	{
  		"source": "/",
  		"has": [{ "type": "host", "value": "kochbuch.monaundtobi.de" }],
  		"destination": "https://kochbuchbande.de/@tobi/unser-kochbuch",
  		"permanent": true
  	},
  	{
  		"source": "/:path*",
  		"has": [{ "type": "host", "value": "kochbuch.monaundtobi.de" }],
  		"destination": "https://kochbuchbande.de/:path*",
  		"permanent": true
  	}
  ]
  ```
- [ ] Passkeys gelten nur für die Domain, auf der sie angelegt wurden. Nach dem Umzug neu anlegen.

## 2. E-Mail (Scaleway Transactional Email)

- [x] In Scaleway (Region `fr-par`) die Domain `mail.kochbuchbande.de` anlegen.
- [x] Die DNS-Einträge für SPF und DKIM von Scaleway setzen, dazu DMARC: `_dmarc.mail.kochbuchbande.de` mit `v=DMARC1; p=none; rua=mailto:support@kochbuchbande.de`. Nach einigen Wochen ohne Probleme auf `p=quarantine`.
- [x] API-Key nur mit Rechten für Transactional Email anlegen.
- [x] In Vercel setzen: `SCW_SECRET_KEY`, `SCW_PROJECT_ID`, `MAIL_FROM=Kochbuchbande <hallo@mail.kochbuchbande.de>`, `MAIL_REPLY_TO=support@kochbuchbande.de`.
- [ ] Postfach `support@kochbuchbande.de` einrichten.

### Später: Webhook für Bounces und Spam (nicht nötig zum Start)

Ohne Webhook erfährt die App nicht, wenn Mails nicht ankommen. Bei wenigen Mails ist das unkritisch. Nachholen, sobald mehr los ist, Scaleway vor Bounces warnt oder Mails im Spam landen.

Vorsicht: SvelteKits CSRF-Schutz blockt in Produktion POSTs mit `Content-Type: text/plain` ohne `Origin`, so wie SNS sie schickt. Darum erst das echte Format ansehen, dann den Code anpassen lassen.

- [ ] `openssl rand -hex 32` als `MAIL_WEBHOOK_SECRET` in Vercel setzen.
- [ ] In Topics and Events (selbes Projekt, `fr-par`) ein Topic anlegen, z. B. `tem-events`.
- [ ] HTTPS-Subscription auf eine URL von webhook.site anlegen und mit der `SubscribeURL` aus der ersten Nachricht bestätigen.
- [ ] In TEM bei `mail.kochbuchbande.de` einen Webhook auf das Topic anlegen: `email_dropped`, `email_mailbox_not_found`, `email_spam`, `email_blocklisted`.
- [ ] Anmelde-Link an eine nicht existierende Adresse schicken. Header und Body der Nachricht auf webhook.site sichern und `/api/mail/webhook` daran anpassen lassen.
- [ ] Subscription auf `https://kochbuchbande.de/api/mail/webhook?secret={MAIL_WEBHOOK_SECRET}` anlegen (die App bestätigt selbst), die webhook.site-Subscription löschen.
- [ ] Erneut testen: `select * from mail_suppressions order by created_at desc;` zeigt die Adresse.

## 3. Vercel

- [x] `BETTER_AUTH_SECRET` setzen (`openssl rand -base64 32`).
- [x] Prüfen, dass `ISR_BYPASS_TOKEN` und `CRON_SECRET` gesetzt sind. Die alten Variablen `ADMIN_PASSWORD_HASH` und `SESSION_SECRET` löschen.
- [x] `BUGSINK_DSN` für Production und Preview setzen. Unerwartete Fehler aus Server und Browser landen dann in Bugsink, Previews unter der Umgebung `preview`.
- [x] Bugsink (gehostet, Bugsink B.V.) in der Datenschutzerklärung nennen.

## 4. Konten nach dem ersten Deployment

- [x] Die Migration legt `tobi` (Admin) und `mona` mit Platzhalter-Adressen an. In der Neon-Konsole die echten Adressen eintragen:
  ```sql
  update users set email = '…' where username = 'tobi';
  update users set email = '…' where username = 'mona';
  ```

## 5. Backups

So funktionieren die Rechte bei Scaleway: Rechte hängen nie an einem API-Key, sondern an einer **Anwendung** (IAM → Applications). Eine **Policy** gibt der Anwendung Rechte in einem Projekt. Jeder API-Key einer Anwendung hat genau deren Rechte. Für unterschiedliche Rechte braucht es also unterschiedliche Anwendungen, z. B. `kochbuchbande-mail` (Mails senden) und `kochbuchbande-backup` (Backups schreiben). Eine Policy gilt immer für alle Buckets eines Projekts, deshalb liegen die Backups in einem eigenen Projekt.

### Projekt und Bucket

- [x] Organisation → Projects → **Create project**, Name `kochbuchbande-backups`. Oben links in dieses Projekt wechseln.
- [x] Object Storage → **Create bucket**: Region `Paris (fr-par)`, Name z. B. `kochbuchbande-backups` (weltweit eindeutig), Sichtbarkeit **Private**. Optional „Object Lock“ aktivieren: Dann kann niemand Backups vor Ablauf löschen, auch kein gestohlener Key. Das geht nur beim Anlegen.
- [x] Im Bucket → **Lifecycle rules** drei Regeln „Expiration“ anlegen: Präfix `database/daily/` nach 30 Tagen, `database/monthly/` nach 360 Tagen, `images/` nach 30 Tagen.
- [x] Lifecycle-Regeln für Bilder umstellen: Die Regel für `images/` auf Präfix `images/weekly/` ändern (30 Tage) und eine neue Regel `images/monthly/` nach 360 Tagen anlegen. Sonst löscht die alte Regel auch die monatlichen Bilder nach 30 Tagen.

### Anwendung und API-Key für GitHub

- [x] IAM → Applications → **Create application**, Name `kochbuchbande-backup`.
- [x] Beim Anlegen (oder danach unter „Policies“) eine Policy hinzufügen: **Scope** „Access to resources“, Projekt `kochbuchbande-backups`. **Permission set** nur `ObjectStorageObjectsWrite`. Nicht `ObjectStorageObjectsRead`, nicht `ObjectStorageObjectsDelete`, nicht `ObjectStorageFullAccess`: Wer den Key stiehlt, kann damit nur neue Dateien hochladen, aber keine Backups lesen oder löschen.
- [x] In der Anwendung → **API keys** → **Generate API key**. Bei „Will this API key be used for Object Storage?“ **Yes** wählen und als „Preferred project“ `kochbuchbande-backups` angeben, sonst sucht der Key den Bucket im falschen Projekt.
- [x] Access Key und Secret Key sofort notieren, das Secret wird nur einmal angezeigt.

### Neon

- [x] In der Neon-Konsole (Production-Projekt) → **Roles** → neue Rolle `backup` anlegen und im SQL-Editor nur Leserechte geben:
  ```sql
  grant usage on schema public, drizzle to backup;
  grant select on all tables in schema public, drizzle to backup;
  alter default privileges in schema public grant select on tables to backup;
  ```
- [x] Die Verbindungs-URL dieser Rolle (direkt, nicht „pooled“) ist `BACKUP_DATABASE_URL`.

### Verschlüsselung

- [x] `age-keygen -o key.txt`. Die Zeile „public key: age1…“ ist `AGE_PUBLIC_KEY`. Den Inhalt von `key.txt` in den Passwort-Manager und ausgedruckt sicher verwahren, dann `key.txt` löschen. Ohne diesen Schlüssel sind alle Backups wertlos.

### GitHub

- [x] Repository → Settings → Secrets and variables → Actions. **Secrets:** `BACKUP_DATABASE_URL`, `SCW_BACKUP_ACCESS_KEY`, `SCW_BACKUP_SECRET_KEY`, `BLOB_READ_WRITE_TOKEN` (aus Vercel, für die Bilder). **Variables:** `BACKUP_BUCKET` (Bucket-Name), `AGE_PUBLIC_KEY`, `PG_MAJOR` (Postgres-Version von Neon, Standard 18).
- [x] Actions → „Backup“ → **Run workflow**, einmal mit „images“ angehakt. Danach in Scaleway im Bucket prüfen, dass `database/daily/…` und `images/…` angekommen sind.
- [x] Einmal ein Backup nach README entschlüsseln und in einen Neon-Branch einspielen. Der nächtliche Test spielt den Dump vor dem Verschlüsseln ein, das Entschlüsseln prüft er nicht, weil der private Schlüssel nicht in GitHub liegt. Zum Herunterladen brauchst du Lesezugriff: im Projekt `kochbuchbande-backups` über die Konsole (als Besitzer darfst du alles) oder mit einem eigenen, kurzlebigen Key einer Anwendung mit `ObjectStorageObjectsRead`.

## 6. Neon

- [x] Region prüfen: `aws-eu-central-1` (Frankfurt).
- [x] CU-Stunden ab und zu in der Neon-Konsole ansehen. Für den Speicher warnt der nächtliche Job ab 80 %, für die CU-Stunden nicht.

## 7. Recht

- [ ] Eine ladungsfähige c/o-Adresse buchen (Impressum-Service, ab ca. 6 € im Monat), damit die Privatadresse nicht im Netz steht. Ein Postfach reicht nicht.
- [ ] Name und diese Adresse in `src/lib/site.ts` (`OPERATOR`) eintragen. Bis dahin stehen dort Platzhalter in eckigen Klammern.
- [ ] Postfach `support@kochbuchbande.de` einrichten, es steht in Impressum, Datenschutz und Nutzungsbedingungen.
- [ ] Mit GitHub einen Vertrag zur Auftragsverarbeitung prüfen (GitHub Data Protection Agreement), die Backups laufen dort unverschlüsselt durch.
- [ ] Nutzungsbedingungen, Datenschutzerklärung und Impressum (`/nutzungsbedingungen`, `/datenschutz`, `/impressum`) rechtlich prüfen lassen. Kommen je Einnahmen dazu (Spenden, Affiliate-Links), gilt zusätzlich § 5 DDG: dann ein zweiter schneller Kontaktweg, z. B. ein Kontaktformular.
- [ ] Bildregel beim Import (nur CC0, CC BY, CC BY-SA) prüfen lassen.

## 8. Bestand

- [x] Rezepte, deren Texte wörtlich von anderen Seiten stammen, in eigenen Worten umformulieren.
- [x] Kategorien nachsortieren: Die Migration hat „Herzhaft“ zu „Hauptgericht“ gemacht. Suppen, Soßen, Spätzle, Energiekugeln usw. in die neuen Kategorien verschieben.

## Nicht umgesetzt

- Phase 4 der Spec (optional): „Neu seit deinem Besuch“, App zum Installieren mit „Teilen an Kochbuch“, Anzeige „Mona bearbeitet gerade“. Der QR-Code auf dem Profil ist umgesetzt.
- Phase 5 (Finanzierung): erst nach allen anderen Phasen und mit Blick auf die Besucherzahlen.
