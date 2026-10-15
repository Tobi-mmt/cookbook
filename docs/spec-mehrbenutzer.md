# Spec: Kochbuch für alle

Status: Entwurf zur Verfeinerung. **Entschieden** markiert getroffene Entscheidungen, **Offen** das, was noch fehlt. Übersicht in Abschnitt 12.

## 1. Ziel

Aus dem persönlichen Kochbuch von Mona und Tobias wird eine Plattform:

- Jede Person kann sich anmelden und eigene Rezepte anlegen oder aus einem Link importieren.
- Mehrere Personen können gemeinsam ein Kochbuch bearbeiten.
- **Alle Rezepte sind öffentlich.** Jeder kann alle Rezepte durchsuchen, nachkochen und in sein eigenes Kochbuch übernehmen.
- Die eigenen Rezepte sind von jedem Gerät ohne Anmeldung erreichbar, über eine merkbare Adresse wie `/@tobi`.

Die Anwendung ist **nur auf Deutsch**: Oberfläche, Mails und Pfade. Rezepte dürfen in jeder Sprache geschrieben sein. Es gibt keine Übersetzungs-Infrastruktur.

Leitlinie: so wenige Begriffe, Einstellungen und Rechte wie möglich. Wer nichts teilen will, merkt vom Konzept „Kochbuch“ fast nichts.

## 2. Grundprinzipien

1. **Alles ist öffentlich.** Es gibt keine privaten Rezepte oder Kochbücher und keine Sichtbarkeitseinstellung. Rechte regeln nur, **wer bearbeiten darf**.
2. **Rezepte gehören einem Kochbuch, nicht einer Person.** Jedes Rezept liegt in genau einem Kochbuch. Wer ein Kochbuch bearbeiten darf, darf alle Rezepte darin bearbeiten.
3. **Jede Person bekommt beim Registrieren automatisch ein eigenes Kochbuch.** Man kann sofort Rezepte anlegen, ohne vorher etwas einzurichten.
4. **Übernehmen heißt kopieren.** „In mein Kochbuch“ legt eine unabhängige Kopie an, die auf das Original verweist. Änderungen am Original ändern die Kopie nicht und umgekehrt.
5. **Lesen braucht nie ein Login.** Ein Login ist nur zum Anlegen, Bearbeiten, Importieren und Übernehmen nötig.
6. **Alle Inhalte stehen unter [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de).** Wer ein Rezept oder ein eigenes Foto veröffentlicht, erlaubt allen, es mit Namensnennung weiterzuverwenden und anzupassen, wenn die Bearbeitung unter derselben Lizenz steht. Das ist die rechtliche Grundlage für „In mein Kochbuch“ (siehe Abschnitt 9, „Lizenz der Inhalte“).
7. **Das bisherige Design bleibt unbedingt erhalten.** Neue Seiten wie Profil, Kochbuch, Registrierung, Bearbeiten und Admin-Bereich folgen dem heutigen minimalistischen Stil und erfinden keinen neuen (siehe Abschnitt 6, „Design“).

## 3. Begriffe

| Begriff        | Bedeutung                                                                           |
| -------------- | ----------------------------------------------------------------------------------- |
| **Person**     | Konto mit eindeutigem Benutzernamen, z. B. `tobi`                                   |
| **Kochbuch**   | Sammlung von Rezepten mit einer oder mehreren Personen, die es bearbeiten dürfen    |
| **Rezept**     | liegt in genau einem Kochbuch, hat eine feste ID                                    |
| **Bearbeiter** | Person, die ein Kochbuch und alle Rezepte darin bearbeiten darf                     |
| **Besitzer**   | Bearbeiter, der zusätzlich Mitglieder verwaltet, das Kochbuch umbenennt oder löscht |
| **Admin**      | betreibt die Anwendung, darf alles bearbeiten und bearbeitet Meldungen              |

## 4. Rollen und Rechte

| Aktion                                             | Gast | Angemeldet | Bearbeiter | Besitzer |
| -------------------------------------------------- | :--: | :--------: | :--------: | :------: |
| Rezepte und Kochbücher ansehen, durchsuchen        |  ✓   |     ✓      |     ✓      |    ✓     |
| Rezept in eigenes Kochbuch übernehmen              |  –   |     ✓      |     ✓      |    ✓     |
| Rezept anlegen, importieren, bearbeiten, löschen   |  –   |     –      |     ✓      |    ✓     |
| Bearbeiter einladen                                |  –   |     –      |     ✓      |    ✓     |
| Bearbeiter entfernen, Kochbuch umbenennen, löschen |  –   |     –      |     –      |    ✓     |

- Es gibt nur diese zwei Rollen. Eine Leser-Rolle entfällt, weil ohnehin alles öffentlich ist.
- **Entschieden:** Auch Bearbeiter dürfen einladen, das macht gemeinsames Kochen mit Familie einfacher. Entfernen kann nur der Besitzer.
- Ein Kochbuch hat genau einen Besitzer. Die Besitzerrolle lässt sich an einen Bearbeiter übergeben.
- **Melden** dürfen alle, auch Gäste ohne Konto (siehe Abschnitt 7).
- **Admin** ist eine Rolle der Anwendung, nicht eines Kochbuchs. Admins dürfen alles: jede Person, jedes Kochbuch und jedes Rezept bearbeiten sowie Meldungen bearbeiten (siehe Abschnitt 7).

## 5. Adressen (Domain und Pfade)

### Domain

- Eine neutrale Produkt-Domain. **Offen:** Der Name steht noch nicht fest. Bis dahin steht in dieser Spec `{domain}` als Platzhalter.
- `kochbuch.monaundtobi.de` leitet dauerhaft (301) auf das Kochbuch von Mona und Tobias weiter.
- Keine Subdomains pro Person: Wildcard-DNS, Cookies über Subdomains und Caching pro Host wären viel Aufwand ohne Nutzen.

### Pfade

| Pfad                                        | Inhalt                                                      | Login      |
| ------------------------------------------- | ----------------------------------------------------------- | ---------- |
| `/`                                         | Startseite: Suche über alle Rezepte, neue Rezepte, Einstieg | –          |
| `/@{benutzername}`                          | Profil: Kochbücher und alle Rezepte der Person              | –          |
| `/@{benutzername}/{kochbuch}`               | Kochbuch: Kacheln, Filter, Suche im Kochbuch                | –          |
| `/@{benutzername}/{kochbuch}/einstellungen` | Name, Bearbeiter, Einladungen, Statistik, Löschen           | Bearbeiter |
| `/rezept/{id}/{titel}`                      | Rezept                                                      | –          |
| `/rezept/{id}/{titel}/bearbeiten`           | Editor                                                      | Bearbeiter |
| `/neu`, `/import`                           | Rezept anlegen oder importieren, mit Auswahl des Kochbuchs  | ✓          |
| `/einladung/{token}`                        | Einladung annehmen                                          | ✓          |
| `/anmelden`                                 | Anmelden und Registrieren in einem                          | –          |
| `/konto`                                    | Benutzername, E-Mail, Passkeys, Datenexport, Konto löschen  | ✓          |
| `/admin`                                    | Admin-Bereich: Personen, Kochbücher, Rezepte, Meldungen     | nur Admins |

### Warum `/@tobi` statt `/tobi`

Die Idee „Benutzernamen merken und in die URL tippen“ ist genau richtig. Ich empfehle aber das `@` als Präfix:

- Es kann nie mit App-Seiten wie `/neu` oder `/import` kollidieren, auch nicht mit Seiten, die später dazukommen. Ohne `@` müsste jede neue Seite gegen alle Benutzernamen geprüft werden.
- Man erkennt sofort: Hier geht es um eine Person, so wie man es von Instagram, YouTube oder Mastodon kennt.
- **Komfort:** Wer `/tobi` ohne `@` eintippt, wird auf `/@tobi` weitergeleitet, sofern es keine App-Seite mit diesem Namen gibt. Man muss sich das `@` also nicht einmal merken.

### Warum Kochbücher unter dem Besitzer hängen

- `/@tobi/unser-kochbuch` ist lesbar und erklärt, wem es gehört.
- Kochbuch-Namen müssen nur pro Person eindeutig sein. Zwei Personen können beide ein „Weihnachten“ haben.
- Wird der Besitz übergeben, ändert sich die URL. Die alte URL leitet über eine Historie weiter.
- Das Profil einer Person zeigt auch die Rezepte der Kochbücher, in denen sie nur Bearbeiter ist. Diese Kochbücher stehen dort mit dem Hinweis „gemeinsam mit Mona“.

### Warum Rezepte eine eigene, feste Adresse haben

- `/rezept/{id}/{titel}` bleibt gültig, wenn ein Rezept umbenannt, in ein anderes Kochbuch verschoben oder ein Kochbuch umbenannt wird. Geteilte Links (WhatsApp, Lesezeichen) brechen nie.
- Der Titel in der URL ist nur Kosmetik. Bei einem veralteten Titel wird auf den aktuellen weitergeleitet.
- Bestehende Links `/recipe/{id}/{titel}` leiten per 301 auf `/rezept/{id}/{titel}` weiter.

### Benutzernamen

- Erlaubt sind `a–z`, `0–9` und `-`, 3–30 Zeichen. Groß- und Kleinschreibung wird nicht unterschieden.
- Umlaute werden beim Vorschlag umgewandelt („jürgen“ → „juergen“).
- Reservierte Namen wie `admin`, `neu`, `rezept`, `api`, `moderation`, `support` und alle eigenen Seiten sind gesperrt.
- Ändert jemand seinen Benutzernamen, leitet der alte weiter. Ein freigewordener Name wird erst nach 6 Monaten neu vergeben, damit niemand alte Links übernimmt.

### Zugriff von fremden Geräten

- **Ansehen und Kochen:** `/@tobi` eintippen, ganz ohne Login. Der Kochmodus funktioniert auch ohne Konto.
- **Bearbeiten an einem fremden Gerät:** Anmeldung per Magic-Link an die eigene E-Mail oder per Passkey vom eigenen Handy (QR-Code auf dem fremden Gerät, Bestätigung am Handy). Es gibt kein Passwort, das man eintippen oder vergessen kann.
- **Ergänzung:** Auf `/@tobi` gibt es einen Button „QR-Code anzeigen“, um das eigene Kochbuch schnell an fremden Geräten oder bei Freunden zu öffnen.
- Eine Option „Auf diesem Gerät angemeldet bleiben“ ist standardmäßig aktiv. An fremden Geräten kann man sie abwählen, dann endet die Session mit dem Schließen des Browsers.

## 6. Seiten und Abläufe (UX)

### Design

Das heutige Design ist verbindlich. Alle neuen Seiten und Funktionen übernehmen es, statt einen eigenen Stil mitzubringen.

- **Minimalistisch und viel Weiß.** Der Hintergrund ist weiß, Flächen sind hell. Es gibt keine dunklen Bereiche, keine Verläufe in kräftigen Farben und keine dekorativen Elemente.
- **Farbe kommt nur aus zwei Quellen:** aus den Fotos der Rezepte und aus den Highlight-Farben der Rezepte, also der Farbe ihrer Kategorie (siehe „Kategorien und Ernährung“). Alles andere bleibt in Schwarz-, Grau- und Weißtönen (die Design-Tokens in `src/routes/+layout.svelte`). Neue Funktionen bekommen keine eigenen Akzentfarben. Auch Buttons, Badges und Hinweise sind grau mit schmaler Umrandung, wie die Filter-Chips und das „Neu“-Badge.
- **Viel Whitespace.** Inhalte bekommen großzügige Abstände und begrenzte Breiten. Lieber weniger auf einer Seite zeigen als die Seite füllen.
- **Schlanke, gut lesbare Schrift.** Es bleibt bei Roboto in wenigen Schnitten. Die Schrift wirkt leicht, muss aber auch auf dem Handy und für ältere Menschen gut lesbar bleiben: ausreichende Größe, genug Kontrast, keine zu dünnen Schnitte für Fließtext.
- **Zurückhaltende Bedienelemente.** Icons kommen nur aus Lucide mit dünner Linie. Wichtige Informationen stehen im Vordergrund, Nebensächliches wie Kategorien tritt zurück.
- **Mobil zuerst.** Jede neue Seite wird zuerst für das Handy gestaltet und muss dort genauso ruhig wirken wie auf dem Desktop.

### Startseite `/`

- Oben eine große Suche über **alle** Rezepte aller Personen, nach Titel und Zutat.
- Darunter die Filter-Chips wie heute (Kategorie, Vegetarisch, Vegan).
- **Entschieden:** Darunter folgen zwei Kachelraster, auf jeder Kachel klein „von @mona“:
  - **Beliebt:** die Rezepte mit den meisten Aufrufen der letzten 30 Tage, gemessen über das cookielose Tracking (eindeutige Besucher pro Tag, aufsummiert). Berechnet wird das einmal täglich (siehe „Tracking“). Ausgeblendete und gelöschte Rezepte zählen nicht.
  - **Neu:** die neuesten Rezepte, aber nur solche **mit Foto** und nur von Konten, die **seit mehr als 6 Monaten bestehen**. Spam- und Testrezepte frischer Konten und halbfertige Rezepte ohne Bild tauchen so nicht auf der Startseite auf. Über Suche, Profil und Kochbuch sind sie trotzdem erreichbar.
  - Unveränderte Kopien („In mein Kochbuch“) erscheinen in keiner der beiden Listen, nur ihre Originale. Sonst stünde dasselbe Rezept mehrfach da.
  - Solange es noch wenig Daten gibt, z. B. direkt nach dem Start, füllt „Beliebt“ mit den neuesten Rezepten auf.
- Für Gäste ein Einstieg: „Eigenes Kochbuch anlegen“.
- Angemeldete sehen oben eine Abkürzung „Mein Kochbuch“. Sie werden **nicht** automatisch weitergeleitet, denn die Startseite ist der Ort zum Stöbern.

### Profil `/@benutzername`

**Entschieden:** Das Profil zeigt **alle Rezepte der Person auf einer Seite** mit einer großen Suche im Mittelpunkt. Die Kochbücher sind keine Filter, sondern eigene Orte: Sie stehen als Links über der Suche, ein Klick führt direkt ins Kochbuch.

- Kopf mit Name, darunter leise `@benutzername`, die Zahl der Rezepte und ein kleines QR-Code-Icon. **Entschieden:** Es gibt keine Profilbilder und auf dem Profil auch keinen Initialen-Kreis, die Initialen erscheinen nur im Menü der Top-Bar.
- **Kochbücher** als Reihe von Links mit Name, Zahl der Rezepte und „gemeinsam mit Mona“, auch bei nur einem Kochbuch. Auf dem Handy ist die Reihe seitlich scrollbar.
- **Suche** über alle Rezepte der Person, nach Titel und Zutat, mit der Zahl der Treffer.
- **Alle Rezepte** der Person als Kacheln, aufgebaut und sortiert wie die heutige Startseite, darüber kleiner die Kategorie- und Ernährungs-Chips. Gemeint sind alle Rezepte aus den Kochbüchern, in denen die Person Bearbeiter ist, also auch gemeinsame. Rezepte anderer Bearbeiter tragen „von Mona“.
- Alle Kochbücher sind außerdem über das Menü der Top-Bar erreichbar, dort lassen sich auch neue anlegen.

### Kochbuch `/@benutzername/kochbuch`

- Entspricht der heutigen Startseite: Kacheln, Filter, Suche, „Neu“-Badge.
- Für Bearbeiter zusätzlich ein „+“-Button (auf dem Handy schwebend) mit „Neues Rezept“ und „Importieren“, beides landet in diesem Kochbuch.
- In gemeinsamen Kochbüchern steht auf den Kacheln „von Mona“.

### Rezept `/rezept/{id}/{titel}`

- Wie heute.
- **Entschieden:** Es gibt keine Bewertungen, Kommentare, Likes oder „Nachgekocht“-Zähler. Rezepte bleiben reine Inhalte, das hält Oberfläche und Moderation schlank.
- **Für alle Angemeldeten:** „In mein Kochbuch“. Bei mehreren eigenen Kochbüchern folgt die Auswahl, wohin.
- **Für Bearbeiter:** „Bearbeiten“, „Verlauf“ und „Verschieben nach …“.
- **Für alle:** „Teilen“ kopiert den Link oder öffnet das native Teilen-Menü auf dem Handy.
- Fußzeile: „In _Unser Kochbuch_ von @tobi · hinzugefügt von Mona · zuletzt geändert 12. Okt.“
- Übernommene Rezepte zeigen „Übernommen von _Bärlauchsuppe_ aus dem Kochbuch von @mona“, verlinkt auf das Original, solange es existiert.

### Registrierung

1. E-Mail eingeben. Es kommt ein Magic-Link. Danach bietet die App an, einen Passkey für schnelles Anmelden anzulegen.
2. Benutzername wählen, mit Vorschlag aus dem Namen. Live wird angezeigt, ob er frei ist, und die künftige Adresse `{domain}/@tobi`.
3. Es entsteht automatisch das Kochbuch „Mein Kochbuch“ unter `/@tobi/mein-kochbuch`. Der Name ist später änderbar.
4. Der Leerzustand des Kochbuchs zeigt drei Aktionen: **Rezept anlegen**, **Aus Link importieren**, **Rezepte entdecken** (führt zur Startseite).
5. Bestätigung „Ich bin mindestens 16 Jahre alt“. **Entschieden:** Konten gibt es ab 16, weil man in Deutschland ab diesem Alter selbst in die Datenverarbeitung einwilligen kann.
6. Ein Hinweis, einmalig und klar: „Deine Rezepte sind für alle sichtbar und stehen unter CC BY-SA 4.0: Jeder darf sie mit Namensnennung übernehmen und anpassen.“ Die Registrierung geht nur mit Zustimmung zu Nutzungsbedingungen und Datenschutzerklärung.

**Entschieden:** Die Registrierung ist **von Anfang an für alle offen**. Deshalb gilt:

- Die Moderation (Melden, Admin-Bereich, Rate-Limits) muss vor dem Start fertig sein.
- Registrierungs- und Meldeformular sind mit einem datenschutzfreundlichen Captcha ohne Drittanbieter geschützt, z. B. [ALTCHA](https://altcha.org) (Proof-of-Work, selbst gehostet, ohne Cookies).
- Neue Konten sind 14 Tage nicht indexiert (siehe Abschnitt 9) und haben in dieser Zeit niedrigere Limits, z. B. 10 Rezepte und 20 Bilder pro Tag.

### Einladen und gemeinsam bearbeiten

- Kochbuch-Einstellungen → „Person einladen“ → „Einladungslink kopieren“ für WhatsApp, optional per E-Mail.
- Ein Link gilt 7 Tage, ist mehrfach nutzbar und lässt sich widerrufen.
- Annehmen: Link öffnen, anmelden oder registrieren, „Unser Kochbuch von @tobi beitreten?“ bestätigen, fertig.
- Die Bearbeiterliste zeigt Besitzer, Bearbeiter und offene Einladungen.

### Gleichzeitiges Bearbeiten

- Kein Live-Co-Editing. Zwei Personen bearbeiten selten gleichzeitig dasselbe Rezept, und Live-Editing wäre teuer und für Nutzer eher verwirrend.
- **Konfliktwarnung:** Der Editor merkt sich die Version beim Öffnen. Hat jemand anderes inzwischen gespeichert, erscheint „Mona hat dieses Rezept vor 2 Minuten geändert“ mit **Änderungen ansehen**, **Meine Version speichern** und **Verwerfen**.
- Der Entwurf wird laufend lokal im Browser gesichert, damit bei Konflikten, Abstürzen oder abgelaufenen Sessions nichts verloren geht.

### Versionsverlauf

**Entschieden:** Jedes Rezept hat einen Verlauf der **letzten 20 Versionen**. Er schützt gemeinsame Kochbücher vor versehentlich oder absichtlich zerstörten Rezepten.

- Jedes Speichern legt eine Version an: kompletter Stand des Rezepts mit Zutaten, Schritten und Bild, dazu wer und wann.
- Bearbeiter öffnen am Rezept „Verlauf“: eine Liste „12. Okt., 18:04 – Mona“. Ein Klick zeigt die Vorschau der damaligen Version, „Diese Version wiederherstellen“ macht sie wieder aktuell.
- Es gibt keine Vergleichsansicht, nur Vorschau und Wiederherstellen.
- Wiederherstellen überschreibt nichts, sondern legt eine **neue** Version an. Das Wiederherstellen lässt sich also selbst rückgängig machen.
- Die Konfliktwarnung („Mona hat dieses Rezept geändert“) nutzt denselben Verlauf für „Änderungen ansehen“.
- Admins sehen den Verlauf jedes Rezepts, auch im Fall einer Meldung.

### Übernehmen („In mein Kochbuch“)

- Ein Klick legt eine Kopie im eigenen Kochbuch an. Bei mehreren Kochbüchern kommt vorher die Auswahl.
- Danach öffnet sich die Kopie mit dem Hinweis „Kopie in _Mein Kochbuch_ angelegt“ und dem Angebot „Jetzt anpassen“.
- Die Kopie hat eine eigene ID und eigene Bilder sowie einen Verweis auf das Original.
- **Entschieden:** Es gibt **kein** zusätzliches „Merken“ (Lesezeichen ohne Kopie). Wer ein Rezept behalten will, übernimmt es. Eine Funktion ist leichter zu verstehen als zwei.

### Kategorien und Ernährung

**Entschieden:** eine **feste, erweiterte Liste von Kategorien**, die Admins pflegen. Es gibt keine freien Tags, die verwildern und moderiert werden müssten.

- Jedes Rezept hat genau eine Kategorie. **Entschieden:** eine kurze Liste mit **8 Kategorien**, damit die Filter-Chips auf dem Handy übersichtlich bleiben. Jede Kategorie hat eine Farbe für Punkt und Icons. Die Farben der heutigen vier Kategorien bleiben, die neuen sind ein Vorschlag:

| Kategorie         | enthält z. B.                     | Farbe     |
| ----------------- | --------------------------------- | --------- |
| Frühstück         | Müsli, Pfannkuchen, Aufstriche    | `#F2A65A` |
| Vorspeise & Snack | Dips, Fingerfood, Energiekugeln   | `#4FB3A9` |
| Suppe             | Suppen, Eintöpfe                  | `#C9785B` |
| Salat             | Salate, Bowls                     | `#57B16B` |
| Hauptgericht      | Pasta, Currys, Aufläufe, Braten   | `#DD5D58` |
| Beilage & Soße    | Spätzle, Gemüse, Soßen            | `#5B8DC9` |
| Backen & Dessert  | Brot, Kuchen, Plätzchen, Desserts | `#8882A8` |
| Getränke          | Bowle, Smoothies                  | `#F0CD5B` |

- Die Ernährung bleibt ein eigenes Feld: Vegan, Vegetarisch, Fisch, Fleisch. „Fisch“ ist neu.
- Die Filter-Chips auf Startseite, Profil und Kochbuch zeigen nur Kategorien, die dort auch vorkommen.
- Admins verwalten die Liste im Admin-Bereich: anlegen, umbenennen, Farbe, Reihenfolge. Eine Kategorie, die noch Rezepte hat, lässt sich nur löschen, wenn man vorher eine Ersatzkategorie wählt.
- Bestand: Salat → Salat, Herzhaft → Hauptgericht, Süßspeise → Backen & Dessert, Getränke → Getränke. Danach einmal von Hand nachsortieren, z. B. Suppen, Soßen, Spätzle und Energiekugeln.

## 7. Admin-Bereich und Moderation

### Zugang

- Der Admin-Bereich liegt unter `/admin`. Admin ist ein Feld an der Person (`users.role = 'admin'`).
- **Entschieden:** Zum Start ist **nur Tobias Admin**, gesetzt per Migration. Er kann im Admin-Bereich später weitere Personen zu Admins ernennen. Solange er der einzige ist, entscheidet er auch über Widersprüche und Fälle zu eigenen Inhalten. Das wird im Audit-Log markiert (siehe Abschnitt 9, „Moderation“).
- Admins müssen sich mit Passkey anmelden, Magic-Link allein reicht für `/admin` nicht.
- Jede Admin-Aktion landet im **Audit-Log**: wer, wann, was, an welchem Objekt, mit vorher/nachher.
- Admins bearbeiten Inhalte mit denselben Editoren wie alle anderen. Im Editor steht dann ein Hinweis „Du bearbeitest als Admin ein fremdes Rezept“. Als `updated_by` wird der Admin gespeichert.

### Bereiche

| Bereich        | Inhalt                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Übersicht**  | Offene Meldungen, neue Personen, neue Rezepte der letzten Tage, Aufrufstatistik (die heutige Statistik zieht hierher um)                                                                                                                                            |
| **Meldungen**  | Warteschlange aller Meldungen, siehe unten                                                                                                                                                                                                                          |
| **Personen**   | Suche nach Name, Benutzername und E-Mail. Bearbeiten: Anzeigename, Benutzername, E-Mail, Admin-Rolle. Aktionen: verwarnen, sperren und entsperren, abmelden (alle Sessions beenden), löschen. Daneben die Kochbücher, Rezepte, Meldungen von und gegen diese Person |
| **Kochbücher** | Suche nach Name und Besitzer. Bearbeiten: Name, Slug, Besitzer übertragen, Bearbeiter hinzufügen und entfernen, Einladungen widerrufen. Aktionen: ausblenden, wieder einblenden, löschen und wiederherstellen                                                       |
| **Rezepte**    | Suche nach Titel, Zutat, Kochbuch und Person. Bearbeiten im normalen Editor. Aktionen: Bild entfernen, in ein anderes Kochbuch verschieben, ausblenden, wieder einblenden, löschen und aus dem Papierkorb wiederherstellen                                          |
| **Kategorien** | Liste der Kategorien pflegen: Name, Farbe, Reihenfolge, Ersatzkategorie beim Löschen                                                                                                                                                                                |
| **Audit-Log**  | Alle Admin-Aktionen, filterbar nach Admin, Objekt und Zeitraum                                                                                                                                                                                                      |

**Ausblenden vs. Löschen:**

- _Ausgeblendete_ Inhalte sind öffentlich nicht mehr sichtbar (404, nicht in Suche und Sitemap). Ihre Bearbeiter sehen sie weiterhin, mit einem Banner „Von der Moderation ausgeblendet: Grund …“, und können sie korrigieren und Widerspruch einlegen.
- _Gelöschte_ Inhalte landen 30 Tage im Papierkorb, danach endgültig weg.
- _Gesperrte_ Personen können sich nicht mehr anmelden. Ihr Profil ist öffentlich ausgeblendet. Kochbücher, in denen sie allein sind, werden ausgeblendet. Gemeinsame Kochbücher bleiben für die übrigen Bearbeiter erhalten.

### Melden

**Was gemeldet werden kann:** Bild, Rezept, Kochbuch (Name, Titelbild), Person (Benutzername, Anzeigename, Profil).

**Wo:** Ein unauffälliger Link „Melden“ an Rezept, Kochbuch und Profil. Am Bild selbst im Kontextmenü bzw. auf dem Handy per langem Tippen und über „Melden → Bild“ am Rezept.

**Ablauf (kleiner Dialog, keine eigene Seite):**

1. **Was?** Ist das Ziel vom Ort aus klar, entfällt der Schritt, z. B. am Rezept die Auswahl „Das Bild“ oder „Das Rezept“.
2. **Warum?** Pflichtauswahl eines Grundes:

| Grund                                                           | Zusätzlich gefragt                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Unangemessener Inhalt (anstößig, gewaltverherrlichend, sexuell) | optional ein Kommentar                                                                                         |
| Urheberrechtsverletzung                                         | **Pflicht:** Link zum Original, ob man selbst Rechteinhaber ist oder in dessen Auftrag handelt, Kontakt-E-Mail |
| Spam oder Werbung                                               | optional ein Kommentar                                                                                         |
| Gefährliche oder falsche Angaben (z. B. Lebensmittelsicherheit) | **Pflicht:** kurze Beschreibung                                                                                |
| Persönliche Daten von anderen                                   | optional ein Kommentar                                                                                         |
| Belästigung oder Beleidigung (bei Personen und Kochbuch-Namen)  | optional ein Kommentar                                                                                         |
| Sonstiges                                                       | **Pflicht:** Beschreibung                                                                                      |

3. **Absenden.** Danach erscheint: „Danke, wir prüfen das.“ Gäste können eine E-Mail angeben, um über das Ergebnis informiert zu werden. Bei Urheberrecht ist das Pflicht.

**Bearbeitung im Admin-Bereich:**

- Meldungen zum selben Objekt werden zu einem **Fall** zusammengefasst, mit Anzahl und allen Gründen.
- Sortierung: zuerst Urheberrecht und gefährliche Angaben, dann nach Anzahl der Meldungen, dann nach Alter.
- Status eines Falls: _Offen_ → _In Prüfung_ → _Erledigt_ (mit Maßnahme) oder _Abgelehnt_ (kein Verstoß).
- Ansicht eines Falls: das gemeldete Objekt in Vorschau (auch wenn ausgeblendet), alle Meldungen, die Geschichte des Objekts (Bearbeitungen, frühere Fälle) und die Person dahinter.
- Maßnahmen mit einem Klick: Bild entfernen, Rezept oder Kochbuch ausblenden oder löschen, Kochbuch umbenennen, Benutzername zurücksetzen, Person verwarnen oder sperren. Zu jeder Maßnahme gehört eine **Begründung**, die die betroffene Person erhält.
- **Benachrichtigungen per E-Mail:**
  - Die betroffenen Bearbeiter erhalten Maßnahme, Grund und Hinweis auf Widerspruch. Das verlangt der DSA bei Einschränkungen.
  - Die meldende Person erhält das Ergebnis, falls sie eine E-Mail hinterlegt hat.
- **Widerspruch:** Betroffene können einmal pro Maßnahme Widerspruch mit Begründung einlegen. Er erscheint als neuer Fall, möglichst für einen anderen Admin.

**Schutz vor Missbrauch der Meldefunktion:**

- Rate-Limit pro Person und IP-Hash, z. B. 10 Meldungen pro Tag.
- Die wiederholte Meldung desselben Objekts durch dieselbe Person zählt nicht doppelt.
- Inhalte werden **nie automatisch** durch Meldungen ausgeblendet. Eine Masse an Meldungen hebt nur die Priorität. Sonst könnte jeder fremde Rezepte durch Sammelmeldungen verschwinden lassen.
- Admins können eine meldende Person als „unzuverlässig“ markieren, dann sinkt die Priorität ihrer Meldungen.

## 8. Architektur

### Anmeldung

- Better Auth mit dem Drizzle-Adapter. Die Sessions liegen in Postgres.
- **Entschieden:** Es gibt nur zwei Anmeldewege, Magic-Link per E-Mail (Versand siehe „E-Mail“) und Passkeys inklusive Anmeldung am fremden Gerät per QR-Code. Es gibt keine Passwörter und kein Google-Login, damit beim Anmelden keine Daten an US-Anbieter gehen.
- Sessions laufen 30 Tage rollierend, außer man wählt „angemeldet bleiben“ ab. Das bisherige Admin-Login (`ADMIN_PASSWORD_HASH`, HMAC-Cookie mit 1 Tag) entfällt.

### Datenmodell

Bestehende Tabellen bleiben (`recipes`, `ingredients`, `steps`, `step_ingredients`, Tracking). Neu oder geändert:

| Tabelle                                     | Felder (Auszug)                                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`, `sessions`, `accounts`, `passkeys` | von Better Auth, `users` ergänzt um `username` (unique, lowercase), `display_name`, `role` (`user` oder `admin`), `banned_at`, `ban_reason`, `storage_limit_bytes`, `accepted_terms_at`                                  |
| `username_history`                          | `old_username`, `user_id`, `released_at`, für Weiterleitungen                                                                                                                                                            |
| `cookbooks`                                 | `id`, `owner_id`, `slug` (unique pro Besitzer), `name`, `cover_recipe_id`, `created_at`                                                                                                                                  |
| `cookbook_slug_history`                     | `cookbook_id`, `owner_id`, `old_slug`, für Weiterleitungen                                                                                                                                                               |
| `cookbook_editors`                          | `cookbook_id`, `user_id`, `role` (`owner` oder `editor`), `joined_at`                                                                                                                                                    |
| `invitations`                               | `cookbook_id`, `token_hash`, `created_by`, `expires_at`, `revoked_at`                                                                                                                                                    |
| `recipe_versions`                           | `recipe_id`, `version`, `snapshot` (JSON mit Rezept, Zutaten, Schritten, Bild), `created_by`, `created_at`. Pro Rezept werden die neuesten 20 behalten                                                                   |
| `categories`                                | `id`, `slug`, `name`, `color`, `position`. Ersetzt die festen Enums für Kategorie; die Ernährung bleibt ein Enum, ergänzt um `Fisch`                                                                                     |
| `recipes` (geändert)                        | plus `category_id`, `cookbook_id`, `created_by`, `updated_by`, `version`, `copied_from_id`, `deleted_at`, `hidden_at`, `hidden_reason`                                                                                   |
| `cookbooks` (Moderation)                    | zusätzlich `hidden_at`, `hidden_reason`, `deleted_at`                                                                                                                                                                    |
| `reports`                                   | `id`, `case_id`, `target_type` (`image`, `recipe`, `cookbook`, `user`), `target_id`, `reason`, `comment`, `original_url`, `is_rights_holder`, `reporter_user_id` oder `reporter_email`, `reporter_ip_hash`, `created_at` |
| `report_cases`                              | `id`, `target_type`, `target_id`, `status`, `priority`, `assigned_to`, `decision`, `decision_reason`, `decided_by`, `decided_at`                                                                                         |
| `appeals`                                   | `case_id`, `user_id`, `reason`, `created_at`, `status`                                                                                                                                                                   |
| `admin_audit_log`                           | `admin_id`, `action`, `target_type`, `target_id`, `before`, `after`, `created_at`                                                                                                                                        |

Rechte prüft eine zentrale Funktion `requireEditor(event, cookbookId)`, die alle Actions und Bearbeiten-Seiten nutzen. Für Admins gibt sie immer Zugriff, protokolliert aber im Audit-Log. Der Admin-Bereich prüft zusätzlich `requireAdmin(event)`. Lesende Seiten prüfen nur, ob ein Inhalt ausgeblendet oder gelöscht ist.

### Caching

Weil alles öffentlich ist, bleibt das Caching so einfach wie heute:

- Alle lesenden Seiten (Startseite, Profil, Kochbuch, Rezept) werden **nutzerneutral** per ISR gecacht.
- Alles Persönliche lädt der Browser nach einem kleinen Aufruf von `/api/me` nach: Initialen-Kreis, „Bearbeiten“, „In mein Kochbuch“, „Neu seit deinem Besuch“. **Wichtig:** Der ISR-Cache ignoriert Cookies. Was serverseitig für eine Person gerendert wird, sähen alle.
- Nach dem Speichern werden gezielt die betroffenen Seiten revalidiert: das Rezept, das Kochbuch, die Profile aller Bearbeiter und die Startseite. Die Funktion `revalidate()` gibt es schon.
- Der Warm-up nach Deploys wärmt bei vielen Rezepten nicht mehr alles, sondern nur Startseite, Profile und die neuesten Rezepte. Der Rest wird beim ersten Aufruf gerendert.
- Bearbeiten-Seiten, `/konto` und `/admin` werden immer dynamisch gerendert, nie gecacht.
- Ausblenden, Sperren und Löschen durch die Moderation revalidieren sofort alle betroffenen Seiten, damit der Inhalt nicht bis zu einem Tag aus dem Cache weiter ausgeliefert wird.

### E-Mail

- **Anbieter:** [Scaleway Transactional Email](https://www.scaleway.com/en/transactional-email-tem/). Französischer Anbieter mit Rechenzentrum in Paris (Region `fr-par`), also EU-Recht und DSGVO.
- **Kosten:** 300 E-Mails pro Monat kostenlos, danach 0,25 € pro 1.000 E-Mails, ohne Grundgebühr und ohne Werbung in den Mails.
- **Absender über die eigene Domain:**
  - **Entschieden:** Der Versand läuft über die Subdomain **`mail.{domain}`**, damit der Ruf der Hauptdomain getrennt bleibt. Absender ist `Kochbuch <hallo@mail.{domain}>`, Antworten gehen an `Reply-To: support@{domain}`.
  - Im DNS kommen die von Scaleway vorgegebenen SPF- und DKIM-Einträge sowie ein DMARC-Eintrag dazu. DMARC startet mit `p=none` und Berichten und wird nach einigen Wochen ohne Probleme auf `p=quarantine` verschärft.
- **Anbindung:** über die REST-API von Scaleway aus einer kleinen Funktion `sendMail({ to, subject, text, html })` in `src/lib/server/mail.ts`. Better Auth (Magic-Link) und die Moderation nutzen nur diese Funktion.
- **Umgebungsvariablen in `src/env.ts`:**
  - `SCW_SECRET_KEY` und `SCW_PROJECT_ID`, beide optional.
  - `MAIL_FROM`, die Absenderadresse.
  - **Lokal ohne Key** wird nichts verschickt, die Mail samt Link erscheint in der Konsole. Das entspricht dem heutigen Fallback für Bilder ohne Blob-Token.

**Welche Mails es gibt:**

| Mail                        | Empfänger             | Auslöser                                                                            |
| --------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| Anmelde-Link (Magic-Link)   | Person                | Anmeldung oder Registrierung, Link 15 Minuten gültig und einmal nutzbar             |
| E-Mail-Adresse bestätigen   | Person                | Änderung der E-Mail-Adresse, an die neue Adresse; zusätzlich Hinweis an die alte    |
| Einladung in ein Kochbuch   | eingeladene Person    | Einladung per E-Mail statt per Link                                                 |
| Maßnahme der Moderation     | betroffene Bearbeiter | Ausblenden, Löschen, Sperren oder Verwarnen, mit Begründung und Weg zum Widerspruch |
| Ergebnis einer Meldung      | meldende Person       | Fall erledigt oder abgelehnt, nur wenn eine E-Mail angegeben wurde                  |
| Ergebnis eines Widerspruchs | betroffene Person     | Entscheidung über den Widerspruch                                                   |
| Konto wird gelöscht         | Person                | Start der 7-Tage-Frist, mit Link zum Abbrechen und zum Datenexport                  |
| Neue Meldungen              | Admins                | höchstens eine Sammelmail pro Tag, Urheberrecht sofort                              |

**Regeln:**

- Alle Mails sind auf Deutsch, mit Text- und schlichter HTML-Version, ohne Bilder von fremden Servern.
- Ohne Öffnungs- und Klick-Tracking, sowohl aus Datenschutzgründen als auch weil Tracking-Links die Zustellbarkeit verschlechtern.
- Keine Werbung und kein Newsletter. Dafür bräuchte es eine Einwilligung und eine Abmeldefunktion.

**Edge Cases:**

- **Mail-Bombing über das Anmeldeformular:** Pro E-Mail-Adresse höchstens 5 Anmelde-Links pro Stunde, pro IP-Hash 20. Die Antwort ist immer „Falls die Adresse existiert, ist ein Link unterwegs“, damit niemand prüfen kann, wer ein Konto hat.
- **Unzustellbare Adressen und Spam-Beschwerden:** Scaleway meldet sie per Webhook. Die Adresse wird markiert, und die Person sieht beim nächsten Login „Bitte E-Mail-Adresse prüfen“. An markierte Adressen geht keine Mail mehr, das schützt den Absenderruf.
- **Scaleway ist nicht erreichbar:** Anmeldung per Passkey funktioniert weiter. Die Magic-Link-Anmeldung zeigt einen klaren Fehler statt „Link verschickt“. Moderations-Mails werden in einer Tabelle zwischengespeichert und später erneut versucht.
- **Kontingent:** Eine Warnung an die Admins ab z. B. 1.000 Mails im Monat, damit unerwartete Kosten (etwa durch Missbrauch) auffallen.
- **Link wird in einem anderen Browser geöffnet** (z. B. im Mail-Programm statt im Browser, in dem die Anmeldung gestartet wurde): Der Link meldet trotzdem an, in dem Browser, in dem er geöffnet wird.

### Datenbank und Backups

**Datenbank:** Neon Free über die Vercel-Integration reicht für den Betrieb aus:

- 1 GB Speicher, heute 8,5 MB belegt.
- 100 CU-Stunden pro Monat, mit Pause nach 5 Minuten Leerlauf.
- 5 GB Datentransfer.

Zu beachten:

- Das Projekt muss in **`aws-eu-central-1` (Frankfurt)** liegen, nah an der Vercel-Region `fra1` und mit Daten in der EU. **Offen:** in der Neon-Konsole prüfen.
- Der größte Verbraucher an Rechenzeit ist das Tracking, weil jeder Seitenaufruf schreibt und die Datenbank weckt. Die Übersicht im Admin-Bereich zeigt den Verbrauch an Speicher und CU-Stunden, ab 80 % geht eine Warnung an die Admins.
- Bei überschrittenem Kontingent pausiert Neon die Datenbank bis zum Monatsende. Gecachte Seiten laufen weiter, Bearbeiten und Anmelden nicht. Dann ist ein Wechsel auf den Bezahlplan nötig.

**Backups:** Neon Free kann nur 6 Stunden zurück wiederherstellen. Das reicht nicht, deshalb gibt es eigene Backups:

|                     |                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wann**            | täglich um 03:00 Uhr per GitHub Action (`.github/workflows/backup.yml`), zusätzlich manuell startbar                                                                                                                                                                                                                      |
| **Was**             | `pg_dump --format=custom` der ganzen Datenbank, inklusive der Migrations-Tabelle von Drizzle. Wöchentlich zusätzlich die Bilder aus Vercel Blob                                                                                                                                                                           |
| **Verschlüsselung** | mit [age](https://age-encryption.org). Der öffentliche Schlüssel liegt als GitHub-Variable vor, der private wird nur zum Wiederherstellen gebraucht. **Entschieden:** Er liegt im Passwort-Manager von Tobias und zusätzlich ausgedruckt an einem sicheren Ort, damit Backups auch ohne den Passwort-Manager rettbar sind |
| **Wohin**           | Scaleway Object Storage, Bucket in `fr-par`, getrennt vom Rest der Infrastruktur                                                                                                                                                                                                                                          |
| **Aufbewahrung**    | **Entschieden:** Tagesbackups 30 Tage, das Backup vom Monatsersten 6 Monate (per Lifecycle-Regel). Bilder: die letzten 4 Wochenstände                                                                                                                                                                                     |
| **Kosten**          | ein Dump ist komprimiert wenige hundert KB groß, Bilder heute unter 200 MB. Bei 0,016 € pro GB und Monat sind das Cent-Beträge                                                                                                                                                                                            |

**Zugänge (GitHub-Secrets):**

- `BACKUP_DATABASE_URL`: eine eigene Neon-Rolle **nur mit Leserechten**.
- Ein Scaleway-API-Key, der **nur Objekte schreiben** darf, nicht lesen oder löschen. Ein gestohlener CI-Schlüssel kann Backups so weder auslesen noch vernichten. Gelöscht wird ausschließlich über die Lifecycle-Regel.
- Optional Object Lock auf dem Bucket, damit Backups vor Ablauf der Aufbewahrung nicht löschbar sind.

**Überwachung:**

- Schlägt der Job fehl, schickt GitHub eine Mail.
- Der Job bricht außerdem ab, wenn der Dump verdächtig klein ist (z. B. unter 50 % des Vortags). So fällt eine versehentlich geleerte Datenbank auf, bevor sie gute Backups verdrängt.

**Wiederherstellung (Ablauf im README):**

1. Backup aus dem Bucket laden und mit dem privaten age-Schlüssel entschlüsseln.
2. In einen **neuen Neon-Branch** einspielen (`pg_restore`), nicht direkt in die Produktion.
3. Im Branch prüfen, z. B. mit einer Preview-Deployment, die auf den Branch zeigt.
4. Bei Erfolg den Branch zur Hauptdatenbank machen oder einzelne Daten zurückkopieren.

**Wiederherstellung testen:** Ein monatlicher Job spielt das neueste Backup in eine temporäre Postgres-Datenbank im GitHub-Runner ein. Er prüft, dass alle Tabellen da sind und die Anzahl der Rezepte plausibel ist. Ein Backup, das nie getestet wurde, ist kein Backup.

**Edge Cases:**

- **Gelöschte Konten in Backups (DSGVO):** Gelöschte Personen bleiben bis zu 6 Monate in Backups. Das steht in der Datenschutzerklärung. Eine Tabelle `deletion_log` merkt sich die IDs gelöschter Konten. Nach jeder Wiederherstellung werden diese Konten erneut gelöscht, damit nichts zurückkommt.
- **Backup läuft während einer Migration:** `pg_dump` erzeugt einen konsistenten Schnappschuss. Deploys um 03:00 Uhr sind ohnehin unwahrscheinlich.
- **Versionsunterschied bei `pg_dump`:** Der Job nutzt ein Postgres-Image mit derselben Hauptversion wie Neon.
- **Neon ist wegen des Kontingents pausiert:** Das Backup schlägt fehl, und genau das soll die Warnung auslösen.
- **Bild gelöscht, Datenbank zeigt noch darauf (nach Wiederherstellung):** Die Wiederherstellung spielt auch die Bilder aus dem passenden Wochenstand zurück. Fehlende Bilder zeigen den Platzhalter statt eines kaputten Bildes.

### Suche

- Der heutige Ansatz (kompletter Index im Browser, Fuse) skaliert nicht auf alle Rezepte aller Personen.
- **Globale Suche** auf der Startseite: serverseitig mit Postgres (`pg_trgm` für Tippfehler und Volltext über Titel und Zutaten), als API mit kurzer CDN-Cachezeit pro Suchbegriff.
- **Suche innerhalb eines Kochbuchs oder Profils** bleibt wie heute im Browser: ein kleiner Index pro Kochbuch, per ISR gecacht.

### Bilder

- Speicherort in Blob: `cookbooks/{cookbook_id}/recipes/{recipe_id}/…`.
- Beim Übernehmen werden die Bilder kopiert, damit Original und Kopie unabhängig gelöscht werden können.
- Zum Bild (heute das JSON-Feld `image`) kommen Herkunftsangaben: `license` (z. B. `CC-BY-4.0`, leer bei eigenen Fotos), `author`, `source_url` und `ai_generated`. Daraus entsteht die Bildunterschrift. Regeln für den Import siehe Abschnitt 9, „Inhalte und Recht“.
- Limits: maximale Bildgröße wie heute. **Entschieden:** **100 MB Bild-Speicher pro Person**, das reicht für etwa 100–200 Rezepte mit Foto.
  - Gezählt wird bei der Person, die ein Bild hochlädt oder ein Rezept mit Bild übernimmt.
  - Unter `/konto` zeigt eine Leiste den Verbrauch, ab 80 % mit Hinweis. Ist das Limit erreicht, sind keine neuen Bilder möglich, gelöscht wird nichts. Bilder in alten Versionen und im Papierkorb zählen mit.
  - Admins können das Limit für einzelne Personen erhöhen.
  - Verlässt eine Person ein gemeinsames Kochbuch oder löscht ihr Konto, zählen ihre Bilder dort ab dann beim Besitzer. Überschreitet der dadurch sein Limit, gilt nur die Upload-Sperre.

### Tracking

- Bleibt cookielos.
- `normalizePath` muss die neuen Pfade erlauben: `/`, `/@…` und `/rezept/…`.
- **Tägliche Auswertung:** Ein nächtlicher Job (Vercel-Cron, zusammen mit dem Warm-up) fasst die Seitenaufrufe des Vortags pro Rezept zusammen, in `recipe_daily_views (recipe_id, day, visitors, views)`. Startseite („Beliebt“) und Kochbuch-Statistik lesen nur diese kleine Tabelle, nie die Rohdaten. Danach wird die Startseite revalidiert.
- Rezept-IDs werden aus dem Pfad `/rezept/{id}/…` gelesen. Aufrufe vor einem Titelwechsel zählen so weiter zum selben Rezept.
- **Entschieden:** Bearbeiter sehen die **Aufrufe ihrer Rezepte pro Kochbuch**, unter `…/einstellungen` im Reiter „Statistik“: Besucher und Aufrufe pro Rezept der letzten 30 Tage, sortiert nach Besuchern, dazu der Verlauf des ganzen Kochbuchs. Die Seite wird dynamisch gerendert, nicht gecacht.
- Aufrufe werden nicht öffentlich angezeigt, also kein Zähler am Rezept (siehe „keine sozialen Funktionen“).
- **Edge Cases:**
  - **Eigene Aufrufe zählen mit,** weil das Tracking anonym ist und nicht weiß, wer schaut. Durch die Tagesbasis zählt eine Person pro Rezept höchstens einmal am Tag. Das bremst auch das Hochtreiben durch Neuladen.
  - **Verschobenes Rezept:** Die Statistik hängt an der Rezept-ID und wandert mit ins neue Kochbuch.
  - **Entschieden:** Rohdaten in `page_views` werden nach **30 Monaten** gelöscht, das erledigt der nächtliche Job. Die Tageswerte in `recipe_daily_views` bleiben dauerhaft. So wächst die Datenbank nicht endlos (1-GB-Limit von Neon).

## 9. Edge Cases

### Inhalte und Recht

- **Urheberrecht bei importierten Rezepten:** Zutatenlisten sind in der Regel nicht geschützt, Fotos und ausformulierte Texte schon. Weil alles öffentlich ist, würden importierte Fotos und Texte veröffentlicht. Vorschlag:
  - Beim Import werden Bilder **nicht automatisch** übernommen, außer sie stehen erkennbar unter einer freien Creative-Commons-Lizenz:
    - Erkannt wird die Lizenz über die schema.org-Daten der Seite (`license` bzw. `acquireLicensePage` am Bild oder Rezept) oder über einen Lizenzlink wie `rel="license"` auf creativecommons.org.
    - Übernommen werden nur Lizenzen, die Weiterverwendung samt Größenänderung erlauben: CC0, CC BY und CC BY-SA. Bei CC BY-NC, CC BY-ND und unklarer Lizenz wird das Bild nicht übernommen.
    - Bei CC BY und CC BY-SA werden Urheber, Lizenz und Quelle gespeichert und unter dem Bild angezeigt, z. B. „Foto: Max Muster, CC BY 4.0, via chefkoch.de“. Die Angabe bleibt auch beim Übernehmen in ein anderes Kochbuch erhalten.
  - Ohne übernommenes Bild zeigt das Rezept einen Platzhalter. Nach dem Import sagt die App klar, warum und was man tun kann:
    > „Das Bild der Originalseite wurde nicht übernommen, weil es urheberrechtlich geschützt ist. Lade ein eigenes Foto hoch, such dir ein freies Bild (z. B. auf Unsplash, Pixabay oder Wikimedia Commons) oder lass dir eins mit KI erzeugen und lade es danach hoch.“
  - Derselbe Hinweis steht im Editor beim leeren Bildfeld, solange das Rezept kein Bild hat.
  - Beim Hochladen bestätigt man einmalig „Ich darf dieses Bild verwenden“. Optional lässt sich ein Bild als „KI-generiert“ markieren, die Kennzeichnung erscheint dann klein unter dem Bild.
  - Ein deutlicher Quellenlink ist Pflicht.
  - Ein Hinweis im Editor: „Formuliere die Schritte in eigenen Worten.“
  - **Offen:** rechtlich prüfen lassen.
- **Alles ist öffentlich:**
  - Das muss bei der Registrierung und im Editor klar sein, z. B. als dauerhafter Hinweis „Öffentlich sichtbar“ neben „Speichern“.
  - Keine Felder, die zu privaten Notizen verleiten. **Entschieden:** Es gibt auch kein separates Feature für private Notizen. Wer ein Rezept anpassen will, übernimmt es und ändert die Kopie.
- **Anstößige oder Spam-Inhalte:**
  - Melden geht an Bild, Rezept, Kochbuch und Profil, mit Pflichtgrund (siehe Abschnitt 7).
  - Rate-Limits für Registrierung, Import und Upload.
  - Neue Konten werden 14 Tage lang nicht indexiert (`noindex`, nicht in der Sitemap). Das unterbindet SEO-Spam.
- **Doppelte Inhalte bei Kopien:** Unveränderte Kopien setzen `rel=canonical` auf das Original. Nach einer Änderung zeigt `canonical` auf die Kopie selbst.
- **Doppelter Import derselben URL im selben Kochbuch:** Hinweis „Schon vorhanden – trotzdem importieren?“.

### Lizenz der Inhalte

**Entschieden:** Alle von Personen erstellten Inhalte, also Rezepttexte und eigene Fotos, stehen unter **CC BY-SA 4.0**.

- **Anzeige:** In der Fußzeile jedes Rezepts steht „Rezept von @mona, CC BY-SA 4.0“, verlinkt auf die Lizenz. Bei übernommenen Rezepten steht die ganze Kette: „Angepasst von @tobi, nach _Bärlauchsuppe_ von @mona, CC BY-SA 4.0“.
- **Übernehmen:** Die Kopie steht automatisch wieder unter CC BY-SA, die Namensnennung des Originals bleibt dauerhaft erhalten.
- **Bilder mit eigener Lizenz:** Beim Import übernommene CC0-, CC BY- und CC BY-SA-Bilder behalten ihre eigene Lizenz und Bildunterschrift.
- **KI-Bilder** sind in der Regel nicht urheberrechtlich geschützt und werden wie eigene Fotos behandelt.
- **Nicht widerrufbar:** CC-Lizenzen gelten dauerhaft. Löscht jemand ein Rezept, bleiben Kopien anderer bestehen. Das steht klar bei der Registrierung und im Dialog „Rezept löschen“: „Kopien, die andere bereits übernommen haben, bleiben bestehen.“
- **Auch außerhalb der Plattform:** Andere Websites dürfen die Rezepte unter denselben Bedingungen weiterverwenden. Das ist so gewollt und steht in den Nutzungsbedingungen.
- **Importierte Texte:** Fremde Texte kann niemand unter CC BY-SA stellen. Deshalb gibt es den Hinweis „Formuliere die Schritte in eigenen Worten“, und der Quellenlink bleibt Pflicht.
- **Konto löschen und Namensnennung:** CC BY-SA erlaubt der Urheberin zu verlangen, dass ihr Name entfernt wird. Beim Löschen des Kontos wird die Namensnennung in allen Kopien zu „von einer ehemaligen Person“. Das passt auch zur DSGVO.
- **Bestand:** Mona und Tobias stimmen der Lizenz für ihre Rezepte zu. Rezepte mit Quellenlink, deren Texte wörtlich übernommen wurden, werden vorher umformuliert.

### Moderation

- **Gemeldetes Bild in einem übernommenen Rezept:** Das Bild wurde beim Übernehmen kopiert. Der Fall zeigt alle Kopien desselben Bildes (gleicher Hash), damit es überall auf einmal entfernt werden kann.
- **Urheberrechtsmeldung zu einem CC-Bild:** Die gespeicherten Lizenzangaben stehen im Fall. Bei falscher Lizenz auf der Quellseite wird das Bild trotzdem entfernt.
- **Gemeldeter Inhalt wird während der Prüfung geändert:** Der Fall speichert einen Schnappschuss zum Zeitpunkt der ersten Meldung. Der Admin sieht beides, den Stand der Meldung und den aktuellen Stand.
- **Ausgeblendetes Rezept wird von den Bearbeitern korrigiert:** Es bleibt ausgeblendet, bis ein Admin es wieder einblendet. Die Bearbeiter können dafür „Erneut prüfen lassen“ anklicken, das öffnet den Fall wieder.
- **Gesperrte Person ist Besitzer eines gemeinsamen Kochbuchs:** Die Besitzerrolle geht automatisch an den am längsten beteiligten Bearbeiter. Gibt es keinen, wird das Kochbuch ausgeblendet.
- **Admin meldet sich selbst oder entscheidet über eigene Inhalte:** Eigene Fälle sind für den betroffenen Admin gesperrt und gehen an einen anderen Admin. Gibt es nur einen, wird es im Audit-Log markiert.
- **Letzter Admin will sich die Rolle entziehen oder sein Konto löschen:** nicht erlaubt.
- **Löschen einer Person durch einen Admin:** gleiche Regeln wie beim eigenen Löschen des Kontos, aber ohne Wartezeit, wenn es um rechtswidrige Inhalte geht.
- **Meldung zu einem bereits gelöschten Inhalt:** Sie wird automatisch als „erledigt, Inhalt nicht mehr vorhanden“ geschlossen.

### Personen und Konten

- **Benutzername ändern:** Der alte Name leitet weiter und wird 6 Monate lang nicht neu vergeben.
- **Verwechselbare Benutzernamen** wie `tobi` und `tobi-`: Doppelte, führende und abschließende Bindestriche sind verboten.
- **Konto löschen:**
  - **Entschieden:** Das Konto wird nach **7 Tagen** gelöscht. Bis dahin steht auf jeder Seite und prominent unter „Konto“, in wie vielen Tagen das passiert, mit „Löschen abbrechen“ und Datenexport. Kochbücher, in denen die Person einzige Bearbeiterin ist, werden mit gelöscht.
  - In gemeinsamen Kochbüchern muss die Besitzerrolle vorher übergeben werden. Ohne Übergabe geht sie automatisch an den am längsten beteiligten Bearbeiter.
  - Rezepte, die die Person in gemeinsamen Kochbüchern angelegt hat, bleiben dort und werden als „von einer ehemaligen Person“ angezeigt.
  - `/@name` liefert danach 404, der Name bleibt 6 Monate gesperrt.
- **Bearbeiter entfernen:** Der Zugriff endet sofort. Die Rezepte der Person bleiben im Kochbuch, weil sie dem Kochbuch gehören.
- **Bearbeiter verlässt ein Kochbuch selbst:** wie Entfernen. Der Besitzer kann nicht gehen, ohne die Rolle zu übergeben.
- **Einladung:**
  - Ohne Konto führt der Link durch die Registrierung und tritt danach bei.
  - Wer schon Bearbeiter ist, sieht einfach das Kochbuch.
  - Bei einem abgelaufenen oder widerrufenen Link erscheint ein klarer Hinweis mit „Bitte um neuen Link bitten“.
  - Ein weitergeleiteter Link funktioniert absichtlich: Links sind nicht an eine E-Mail gebunden. Dafür lassen sie sich widerrufen und laufen ab.
- **Rechte entzogen, während jemand bearbeitet:** Das Speichern wird abgelehnt, der Entwurf bleibt lokal erhalten und lässt sich als eigenes Rezept übernehmen.
- **Session läuft beim Bearbeiten ab:** Nach erneuter Anmeldung in einem Popup wird gespeichert, der lokale Entwurf bleibt erhalten.

### Rezepte und Kochbücher

- **Gleichzeitiges Bearbeiten:** siehe die Konfliktwarnung in Abschnitt 6.
- **Löschen während jemand anderes bearbeitet:** Beim Speichern erscheint „Wurde von Tobias gelöscht“ mit **Wiederherstellen**. Gelöschtes liegt 30 Tage im Papierkorb des Kochbuchs.
- **Rezept verschieben:** Die ID und damit die URL bleibt. Das Rezept erscheint im neuen Kochbuch, und beide Kochbücher werden revalidiert. Verschieben geht nur in Kochbücher, in denen man Bearbeiter ist.
- **Bilder in alten Versionen:** Ein Bild wird erst aus Blob gelöscht, wenn weder das Rezept noch eine seiner gespeicherten Versionen es nutzt. Sonst zeigte „Wiederherstellen“ ein kaputtes Bild.
- **Version eines ausgeblendeten Rezepts wiederherstellen:** Das Rezept bleibt ausgeblendet, bis ein Admin es freigibt. Die Moderation entscheidet, nicht der Verlauf.
- **Wiederherstellen während jemand anderes bearbeitet:** Es greift dieselbe Konfliktwarnung wie beim normalen Speichern.
- **Gelöschtes Rezept:** Der Verlauf liegt mit im Papierkorb und wird beim Wiederherstellen mit zurückgeholt.
- **Original eines übernommenen Rezepts wird gelöscht:** Die Kopie bleibt, der Verweis zeigt „Original nicht mehr verfügbar“.
- **Kochbuch umbenennen:** Der Slug ändert sich, der alte leitet weiter. Reservierte Slugs wie `einstellungen` sind verboten.
- **Besitz übergeben:** Die URL wechselt von `/@alt/kochbuch` zu `/@neu/kochbuch`, die alte leitet weiter. Bei einem Namenskonflikt beim neuen Besitzer bekommt der Slug einen Zusatz, z. B. `-2`.
- **Leeres Kochbuch:** Für Bearbeiter gibt es einen Leerzustand mit Aktionen. Andere sehen „Noch keine Rezepte“. Leere Kochbücher sind nicht in der Sitemap.
- **Letztes Kochbuch löschen:** Das ist nicht erlaubt, jede Person behält mindestens ein Kochbuch. Gibt es nur noch eines, heißt die Option „Alle Rezepte löschen“.

### Technik

- **Personalisierte Inhalte im Cache:** Lesende Seiten dürfen serverseitig nie von Cookies abhängen. Ein Test stellt sicher, dass ISR-Routen keine Session lesen.
- **Viele Rezepte:**
  - Die Sitemap wird in Teil-Sitemaps aufgeteilt (Sitemap-Index).
  - Der Warm-up läuft nur selektiv.
  - Die Kochbuch-Indizes für die Suche werden nur pro Kochbuch erzeugt.
- **Groß- und Kleinschreibung in URLs:** `/@Tobi` leitet auf `/@tobi` weiter.

## 10. Migration des Bestands

1. Konten für Tobias und Mona anlegen. **Entschieden:** Die Benutzernamen sind `tobi` und `mona`.
2. Kochbuch „Unser Kochbuch“ mit Besitzer Tobias und Bearbeiterin Mona anlegen, unter `/@tobi/unser-kochbuch`.
3. Alle bestehenden Rezepte bekommen `cookbook_id`, `created_by` (Tobias), `version` 1. Das echte `created_at` ist schon migriert.
4. Weiterleitungen einrichten:
   - `/recipe/{id}/{titel}` → `/rezept/{id}/{titel}`
   - `kochbuch.monaundtobi.de/` → `/@tobi/unser-kochbuch`
5. Das alte Admin-Login und den alten Admin-Bereich entfernen. `/admin` wird der neue Admin-Bereich, Tobias wird einziger Admin. Die Statistik zieht in dessen Übersicht.

## 11. Umsetzung in Phasen

1. **Konten und eigenes Kochbuch:**
   - Better Auth, Benutzernamen, Profil `/@…`, Kochbuch-Seite.
   - E-Mail-Versand über Scaleway mit eigener Domain (SPF, DKIM, DMARC) für die Anmelde-Links.
   - Nächtliche, verschlüsselte Backups nach Scaleway mit monatlichem Wiederherstellungstest. Das lohnt sich schon vor allen anderen Punkten, auch für den heutigen Stand.
   - Bearbeiten direkt am Rezept statt im alten Admin-Bereich.
   - Neuer Admin-Bereich mit Personen, Kochbüchern, Rezepten, Audit-Log und Statistik.
   - Den Bestand migrieren.
2. **Für alle öffnen:**
   - Registrierung, automatisches eigenes Kochbuch, globale Suche auf der Startseite.
   - „In mein Kochbuch“.
   - Melden-Funktion, Meldungen im Admin-Bereich bearbeiten, Benachrichtigungen, Widerspruch, Rate-Limits. Das muss stehen, bevor sich fremde Personen registrieren können.
3. **Gemeinsam kochen:** Einladungen, Bearbeiter verwalten, mehrere Kochbücher pro Person, Verschieben, Konfliktwarnung, Versionsverlauf, Papierkorb.
4. **Komfort (optional):**
   - „Neu seit deinem Besuch“, QR-Code auf dem Profil.
   - App zum Installieren (PWA) mit „Teilen an Kochbuch“.
   - Anzeige „Mona bearbeitet gerade“.
5. **Finanzierung (ganz zuletzt, am unwichtigsten):** Ziel sind etwa 50 € im Monat, um den Aufwand auszugleichen. Dafür gibt es keine Werbebanner und es werden keine Nutzerdaten verkauft. Erst angehen, wenn alle anderen Phasen fertig sind. Vorher anhand von `/admin/stats` prüfen, ob es genug Besucher gibt.
   - **Unterstützen:** ein dezenter Hinweis „Kochbuch unterstützen“ im Footer und auf dem Profil, z. B. über Ko-fi, Steady oder Liberapay. Das ist am wenigsten Aufwand und wird von Werbeblockern nicht ausgeblendet.
   - **Kochbuch drucken:** ein Kochbuch als gedrucktes Buch per Print-on-Demand bestellen, mit einer kleinen Marge pro Buch. Der PDF-Export bleibt kostenlos.
   - **Partnerlinks, gezielt statt automatisch:** ein optionales Feld „Das brauchst du“ am Rezept für besondere Geräte und seltene Zutaten, z. B. über Amazon PartnerNet, Awin oder Gewürzshops. Keine automatischen Links auf Wörter im Rezepttext, weil sie wenig bringen und Rezepte unruhig machen. Die Links sind als Werbung gekennzeichnet und haben `rel="sponsored"`. Die Nutzungsbedingungen sagen, dass auf Rezepten Partnerlinks erscheinen können.
   - **Später vielleicht:**
     - eine Einkaufsliste mit Übergabe an einen Lieferdienst
     - ein Unterstützer-Konto mit Extras, z. B. mehr Speicher oder Import aus einem Link oder Foto

## 12. Offene Punkte

Noch zu entscheiden:

- [ ] Name der Produkt-Domain

Noch zu erledigen (keine Entscheidung nötig):

- [ ] Nutzungsbedingungen mit CC BY-SA 4.0 rechtlich prüfen lassen
- [ ] Bildregel beim Import (nur CC0, CC BY, CC BY-SA) und Texte rechtlich prüfen lassen
- [ ] Kontaktadresse für Meldungen und Impressum nach DSA rechtlich prüfen lassen
- [ ] Auftragsverarbeitungsverträge (AVV) mit Vercel, Neon und Scaleway abschließen
- [ ] Region des Neon-Projekts prüfen (Frankfurt?)
- [ ] age-Schlüsselpaar erzeugen, privaten Schlüssel im Passwort-Manager ablegen und ausdrucken
- [ ] Erst bei der Finanzierung (Phase 5): klären, ob ein Gewerbe nötig ist (Kleinunternehmerregelung) und was das für Impressum und Steuern bedeutet
