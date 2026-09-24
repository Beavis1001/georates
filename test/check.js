// Frontend-Pruefung ohne Browser: laeuft per GitHub Action bei jedem Push.
//
//  1. Jeder data-i18n-Schluessel im HTML existiert in Deutsch UND in allen Sprachdateien.
//  2. Alle Sprachdateien haben dieselben Schluessel wie Deutsch (nichts vergessen, nichts verwaist).
//  3. Kein HTML laedt Skripte, Bilder oder Styles von fremden Hosts ausser den erlaubten -
//     die Datenschutzerklaerung verspricht, dass beim Seitenaufruf keine Daten an Dritte gehen.
//  4. Kein Inline-Skript auf keiner Seite und kein 'unsafe-inline' in einer CSP.
//  6. Alle eigenen Skripte sind syntaktisch sauber (Chromium-Rechner eingeschlossen).
//  5. Leck-Check wie im API-Repo: keine echten Booking-Links mit Tracking-Parametern.
//
// Aufruf: node test/check.js   (Exit-Code 1 bei Fehlern)

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
let fehler = 0;
const fehl = (m) => { fehler++; console.log('FEHL | ' + m); };
const ok = (m) => console.log('OK   | ' + m);

// --- i18n laden: i18n.js im Sandkasten ausfuehren und das deutsche Woerterbuch abgreifen ---
const src = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const m = src.match(/var translations = \{ de: ([\s\S]*?) \};\n  var loading/);
if (!m) { fehl('i18n.js: deutsches Woerterbuch nicht gefunden'); process.exit(1); }
const de = vm.runInNewContext('(' + m[1] + ')');
const langs = { de };
for (const f of fs.readdirSync(path.join(root, 'i18n'))) {
  if (f.endsWith('.json')) langs[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(root, 'i18n', f), 'utf8'));
}
const deKeys = Object.keys(de);
for (const [l, dict] of Object.entries(langs)) {
  if (l === 'de') continue;
  const fehlt = deKeys.filter((k) => !(k in dict));
  const zuviel = Object.keys(dict).filter((k) => !(k in de));
  if (fehlt.length) fehl(`${l}: ${fehlt.length} Schluessel fehlen: ${fehlt.slice(0, 5).join(', ')}`);
  if (zuviel.length) fehl(`${l}: ${zuviel.length} Schluessel ohne deutsches Original: ${zuviel.slice(0, 5).join(', ')}`);
  if (!fehlt.length && !zuviel.length) ok(`${l}: ${Object.keys(dict).length} Schluessel, vollstaendig`);
}

// --- HTML-Dateien ---
const ERLAUBTE_HOSTS = ['challenges.cloudflare.com', 'georates.tech']; // georates.tech = eigene Canonical-/OG-Links
const htmls = fs.readdirSync(root).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f));
const jsQuellen = [];
for (const f of htmls) {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  // 1. Schluessel
  const keys = [...html.matchAll(/data-i18n(?:-placeholder|-title|-aria)?="([^"]+)"/g)].map((x) => x[1]);
  const unbekannt = [...new Set(keys)].filter((k) => !(k in de));
  if (unbekannt.length) fehl(`${f}: unbekannte i18n-Schluessel: ${unbekannt.join(', ')}`);
  else ok(`${f}: ${new Set(keys).size} i18n-Schluessel bekannt`);
  // 3. Fremde Hosts in src/href von script, img, link, iframe
  const hosts = [...html.matchAll(/<(?:script|img|link|iframe|source)[^>]*?(?:src|href)="(https?:\/\/[^/"]+)/gi)].map((x) => new URL(x[1]).hostname);
  const fremd = [...new Set(hosts)].filter((h) => !ERLAUBTE_HOSTS.includes(h));
  if (fremd.length) fehl(`${f}: laedt Ressourcen von fremden Hosts: ${fremd.join(', ')}`);
  // 4. Inline-Skripte: auf keiner Seite. Seit dem 21.09.2026 haben alle Seiten dieselbe strenge
  //    CSP (script-src 'self'), ein Inline-Skript wuerde der Browser stumm blockieren.
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/gi)];
  if (inline.length) fehl(`${f}: Inline-Skript gefunden, die CSP erlaubt keines`);
  const cspInline = /Content-Security-Policy[^>]*script-src[^;"]*'unsafe-inline'/i.test(html);
  if (cspInline) fehl(`${f}: CSP erlaubt 'unsafe-inline' fuer Skripte`);
  if (!inline.length && !cspInline) ok(`${f}: keine Inline-Skripte, strenge CSP`);
  jsQuellen.push([f, html]);
}
for (const f of ['app.js', 'pwa.js', 'sw.js', 'i18n.js', 'budget.js', 'packliste.js', 'gruppenkosten.js']) jsQuellen.push([f, fs.readFileSync(path.join(root, f), 'utf8')]);

// 5. Leck-Check (Muster aus georates-price-api/test/leck-check.js)
const MUSTER = [
  { name: 'Booking-Tracking-Parameter', re: /[?&](?:aid|label|sid|srpvid|highlighted_blocks|matching_block_id)=\d/i },
  { name: 'Reisedaten im Link', re: /booking\.com[^\s"']*[?&]check(?:in|out)(?:_year)?=\d/i },
];
for (const [f, text] of jsQuellen) {
  text.split('\n').forEach((zeile, i) => {
    if (/leck-check-ok/.test(zeile) || /placeholder\s*=/.test(zeile)) return;
    for (const mu of MUSTER) if (mu.re.test(zeile)) fehl(`${f}:${i + 1} [${mu.name}] ${zeile.trim().slice(0, 100)}`);
  });
}

// Eigene Skripte muessen syntaktisch sauber sein und keine Schluessel benutzen, die es nicht gibt.
for (const f of ['app.js', 'budget.js', 'packliste.js', 'gruppenkosten.js', 'pwa.js', 'sw.js']) {
  try {
    const js = fs.readFileSync(path.join(root, f), 'utf8');
    new vm.Script(js);
    const keys = [...js.matchAll(/\bt\('([a-z0-9_]+)'/g)].map((x) => x[1]);
    const fehltJs = [...new Set(keys)].filter((k) => !k.endsWith('_') && !(k in de)); // 'err_' + reason wird dynamisch gebaut
    if (fehltJs.length) fehl(`${f} benutzt unbekannte Schluessel: ${fehltJs.join(', ')}`);
    else ok(`${f}: ${new Set(keys).size} Schluessel bekannt`);
  } catch (e) { fehl(`${f} parst nicht: ${e.message}`); }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles sauber');
process.exit(fehler ? 1 : 0);
