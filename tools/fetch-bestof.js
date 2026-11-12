/* GeoRates – holt die "Echten Funde" von der API und legt sie als Datei ab.
 *
 * Warum es das gibt
 * -----------------
 * Die Startseite laedt die groessten Ersparnisse per JavaScript nach. Fuer Besucher ist das
 * richtig: sie sehen immer den aktuellen Stand. Suchmaschinen und KI-Crawler fuehren das
 * Skript aber nicht aus - sie sehen an der Stelle nur drei Punkte. Damit ist ausgerechnet
 * das ueberzeugendste Material der Seite (echte Hotels, echte Ersparnisse, nachpruefbar
 * ueber den Permalink) fuer Google, Bing, ChatGPT, Perplexity und Claude unsichtbar.
 *
 * Dieses Skript holt die Daten einmal und schreibt sie nach data/bestof.json.
 * tools/build-langs.js schreibt sie von dort fest in die Startseiten aller sechs Sprachen.
 * Die Datei wird mit eingecheckt - GitHub Pages liefert das Repo direkt aus, es bleibt also
 * dabei, dass beim Deployen nichts gebaut wird.
 *
 * Reihenfolge, die zaehlt:
 *     node tools/fetch-bestof.js     (holt die Daten, braucht Netz)
 *     node tools/build-langs.js      (schreibt sie in die Seiten, braucht kein Netz)
 *
 * Laeuft auch automatisch, siehe .github/workflows/bestof.yml.
 *
 * Das Skript ueberschreibt die vorhandene Datei NUR, wenn die Antwort plausibel ist. Eine
 * leere oder kaputte Antwort darf die Startseite nicht leerraeumen - lieber ein paar Tage
 * alte Funde als gar keine.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ZIEL = path.join(root, 'data', 'bestof.json');

// Die Adresse der API steht in app.js. Von dort lesen statt hier zu wiederholen: Sonst holt
// dieses Skript eines Tages stillschweigend von einer anderen Stelle als die Seite selbst.
function apiBasis() {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const m = app.match(/var\s+API_BASE\s*=\s*'([^']+)'/);
  if (!m) throw new Error('API_BASE nicht in app.js gefunden - bitte dort nachsehen.');
  return m[1];
}

// Was eine brauchbare Antwort ausmacht. Lieber hier streng sein als eine halbe Liste in die
// Startseite schreiben, die dann monatelang so stehen bleibt.
function pruefeAntwort(json) {
  if (!json || json.success !== true) throw new Error('API meldet keinen Erfolg.');
  const e = json.eintraege;
  if (!Array.isArray(e) || !e.length) throw new Error('keine Eintraege in der Antwort.');
  for (const x of e) {
    if (!x.hotel || typeof x.hotel !== 'string') throw new Error('Eintrag ohne Hotelnamen.');
    if (!(x.pct > 0) || !(x.euro > 0)) throw new Error('Eintrag ohne brauchbare Ersparnis: ' + x.hotel);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.datum || '')) throw new Error('Eintrag ohne Datum: ' + x.hotel);
  }
  return e;
}

async function main() {
  const url = apiBasis() + '/best-of';
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('API antwortet mit ' + res.status);
  const json = await res.json();
  const eintraege = pruefeAntwort(json);

  // Nur die Felder uebernehmen, die die Startseite auch anzeigt. Was nicht gebraucht wird,
  // gehoert nicht in eine Datei, die oeffentlich ausgeliefert wird.
  const inhalt = {
    hinweis: 'Erzeugt von tools/fetch-bestof.js - nicht von Hand aendern.',
    stand: new Date().toISOString().slice(0, 10),
    suchenGesamt: Number(json.suchenGesamt) || 0,
    eintraege: eintraege.map((x) => ({
      hotel: x.hotel,
      hotelLand: x.hotelLand || '',
      land: x.land || '',
      baseline: x.baseline || 'DE',
      pct: x.pct,
      euro: x.euro,
      basisEuro: x.basisEuro || null,
      datum: x.datum,
      resultId: x.resultId || '',
    })),
  };

  fs.mkdirSync(path.dirname(ZIEL), { recursive: true });
  fs.writeFileSync(ZIEL, JSON.stringify(inhalt, null, 2) + '\n');
  console.log('OK   | ' + inhalt.eintraege.length + ' Funde geschrieben, Stand ' + inhalt.stand);
  console.log('     | jetzt "node tools/build-langs.js" laufen lassen.');
}

main().catch((e) => {
  console.error('FEHL | ' + e.message);
  console.error('     | data/bestof.json bleibt unveraendert.');
  process.exit(1);
});
