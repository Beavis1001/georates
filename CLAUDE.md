# CLAUDE.md – georates (Frontend)

> **ENTWURF (21.09.2026)** aus einer Session ohne Live-Zugang zu Vercel, Proxy und Booking. Christophers
> Claude-Session: bitte jede Aussage gegen den Code pruefen, Fehlendes ergaenzen (vor allem alles, was nur
> der Betreiber weiss: Deploy-Ablauf, Vercel-Einstellungen, Umgang mit dem Proxy-Account, Auswertung der
> Log-Tabelle), Falsches streichen - und danach diesen Kasten entfernen.

Arbeitsregeln fuer Claude-Code-Sessions in diesem Repo. Wird bei jedem Sessionstart gelesen.
Offene Punkte stehen in `OFFEN.md` im Repo `georates-price-api`, nicht hier.

## Was das ist

Statische Seite georates.tech auf GitHub Pages (Branch `main`, kein Build-Schritt, kein Framework).
Ruft die Preis-API im Repo `georates-price-api` (Vercel) auf. Betreiber: Christopher (GitHub Beavis1001).

| Datei | Aufgabe |
|---|---|
| `index.html` | Startseite: Formular, Ergebnis, Best-of, Ein-Klick-Abschnitt. Nur Markup und CSS, KEIN Inline-JS |
| `app.js` | Gesamte Logik der Startseite: Zimmer laden, Link-Pruefung, Preis-Check mit Stream, Ergebnis, Laenderauswahl, Permalink, Best-of, Share-Target/Bookmarklet |
| `pwa.js` | Service-Worker-Registrierung und Installations-Hinweis, auf allen Seiten |
| `i18n.js` | Laufzeit + deutsches Woerterbuch inline; `i18n/<code>.json` fuer en, es, fr, it, nl werden nachgeladen |
| `tokens.css` | Einzige Quelle der Farb- und Schrift-Tokens; `app.css` (Tools), `legal.css` (Rechtstexte, Ratgeber) bauen darauf |
| `budget.html`, `packliste.html`, `gruppenkosten.html` | Rechner, laufen komplett im Browser (noch mit Inline-JS) |
| `sw.js`, `manifest.webmanifest` | PWA; Manifest hat `share_target` fuer Booking-Links aus dem Teilen-Menue |
| `test/check.js` | i18n-Vollstaendigkeit, fremde Hosts, Inline-Skripte, Leck-Check |

## Befehle

```bash
node test/check.js                       # vor jedem Push; laeuft auch als GitHub Action
python3 -m http.server 8765              # lokal ansehen; fetch() auf i18n/*.json braucht http, nicht file://
```

Die API laesst sich lokal nicht mitstarten. Zum Testen von `app.js` die Aufrufe an
`georates-price-api.vercel.app` mit Playwright `page.route` mocken (Antwortformate: JSON fuer
`rooms`, NDJSON-Zeilen `meta`, `country`, `summary` fuer den Preis-Check).

## Regeln, die nicht verhandelbar sind

1. **Kein Inline-JavaScript in `index.html`.** Die Content-Security-Policy dort erlaubt nur
   `self` und `challenges.cloudflare.com`. Neue Logik gehoert in `app.js`; ein Inline-`<script>`
   laesst den Check rot werden und den Browser das Skript blockieren. Externe Skripte, Bilder oder
   Styles von fremden Hosts sind ebenfalls tabu: Die Datenschutzerklaerung verspricht, dass beim
   Seitenaufruf keine Daten an Dritte gehen. Genau daran sind die Footer-Badges gescheitert.
2. **Jeder sichtbare Text laeuft ueber i18n.** Statischer Text bekommt `data-i18n="<key>"` (oder
   `-placeholder`, `-title`, `-aria`), dynamischer Text in `app.js` laeuft ueber `t('<key>', vars)`.
   Jeder Schluessel muss in `i18n.js` (de) UND in allen fuenf JSON-Dateien stehen, der Check erzwingt
   das. Antwortgruende der API brauchen `err_<reason>`.
3. **Nutzereingaben und API-Antworten immer escapen**, bevor sie in `innerHTML` landen (`escHtml`).
   Gilt auch fuer Zimmernamen, Hotelnamen und `href`-Werte.
4. **Keine echten Suchen im Repo.** Beispiel-Links und Reisedaten werden erfunden; `// leck-check-ok:
   <Begruendung>` fuer bewusste Ausnahmen. Das gilt auch fuer Testdaten und Screenshots.
5. **Frontend und API gehoeren zusammen.** Wer Request-Felder, Antwortgruende oder das Stream-Format
   aendert, aendert beide Repos. Aktuell verlangt die API einen Turnstile-Token auch fuer den
   Zimmer-Abruf; ein Frontend ohne Token bekommt `bot_check_failed`.
6. **Service-Worker-Cache versionieren.** Neue oder umbenannte Dateien in `ASSETS` eintragen und
   `CACHE` in `sw.js` hochzaehlen, sonst liefern installierte Apps alte Dateien aus.

## Fachliche Entscheidungen, die man kennen muss

- **Ein Formular, nicht zwei.** Die Kopie am Seitenende wurde durch einen Aufruf ersetzt; Nav-CTA und
  Aufruf zeigen auf `#suche`.
- **Verpflegung steht auf "Egal".** "Fruehstueck" als Standard erzeugte "kein Preis"-Faelle. Nach
  "Zimmer laden" ist das erste Zimmer sofort ausgewaehlt und Verpflegung/Storno werden mit den
  Optionen befuellt, die es fuer dieses Zimmer wirklich gibt; dafuer muss ein `change`-Event
  ausgeloest werden, nicht nur `selectedIndex` gesetzt.
- **Waehrend der Check laeuft, wird nichts bewertet.** Die Live-Tabelle zeigt nur Zahlen und
  Fortschritt; Hervorhebung und Ersparnis kommen erst mit `summary`. Ein Vorsprung unter der Schwelle
  (`relevantThresholdPct`, 1 % oder 3 % bei Umrechnung) wird nicht als Fund dargestellt.
- **Booking-Link aus drei Wegen:** `?link=` (Bookmarklet), `?url=`/`?text=` (Share Target),
  `?r=<id>` (Permalink). Der Link wird uebernommen und aus der Adresszeile entfernt
  (`history.replaceState`), damit er nicht in Verlauf und Screenshots bleibt.
- **Laendernamen** kommen aus `Intl.DisplayNames` in der aktuellen Sprache; die deutsche Liste in
  `app.js` ist nur der Rueckfall.
- **Footer-Links zu den Launch-Plattformen sind Textlinks**, keine Bilder. Bedingung fuer den
  kostenlosen Eintrag dort, aber ohne Requests an fremde Server.
- **Mobil:** unter 760 px Hamburger-Menue, Beispielkarte hinter der Ueberschrift, SVG-Anleitung
  ausgeblendet (Schrift skalierte auf ~7 px). Kein horizontales Scrollen bei 390 px.

## Rechtstexte

`impressum.html`, `datenschutz.html`, `agb.html` sind in sechs Sprachen ueber i18n gepflegt. Wer eine
Datenverarbeitung ergaenzt (neuer Dienst, neuer Zweck, neue Speicherung), ergaenzt die
Datenschutzerklaerung in allen sechs Sprachen und setzt `common_stand_*` auf den neuen Monat.

## Stil

- Kommentare erklaeren das WARUM mit Datum und Anlass. Deutsch, im Code ohne Umlaute; in Texten fuer
  Nutzer mit Umlauten.
- Commit-Nachrichten: erste Zeile was, danach warum. Keine Modellnamen in Commits, Kommentaren oder Doku.

## Diese Datei pflegen

Wenn du in einer Session etwas gelernt hast, das einer neuen Session Zeit gespart oder einen Fehler
verhindert haette, ergaenze es hier im selben Commit. Kurz, mit dem Warum. Keine Chronik; Erledigtes
und Offenes gehoert in `OFFEN.md` im API-Repo. Streiche, was nicht mehr stimmt.
