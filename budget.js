// budget.html - Logik des Rechners. Bis zum 21.09.2026 stand sie als Inline-Skript in der Seite;
// die CSP brauchte dafuer 'unsafe-inline'. Ausgelagert, damit alle Seiten dieselbe strenge
// CSP wie die Startseite bekommen und test/check.js Inline-Skripte ueberall verbieten kann.
// Wird am Ende des <body> geladen, das DOM steht also bereit.
const PRESETS = {
  guenstig:  { unterkunft: 30,  verpflegung: 20, transport: 8,  aktivitaeten: 10, sonstiges: 5  },
  mittel:    { unterkunft: 70,  verpflegung: 35, transport: 15, aktivitaeten: 20, sonstiges: 10 },
  luxus:     { unterkunft: 180, verpflegung: 70, transport: 30, aktivitaeten: 50, sonstiges: 25 },
};
const FIELD_IDS = ['unterkunft', 'verpflegung', 'transport', 'aktivitaeten', 'sonstiges'];

function applyPreset() {
  const preset = document.getElementById('preset').value;
  if (preset === 'custom' || !PRESETS[preset]) return;
  const values = PRESETS[preset];
  FIELD_IDS.forEach(id => { document.getElementById(id).value = values[id]; });
}

function computeBudget(input) {
  const unterkunftGesamt = input.unterkunft * input.naechte;
  const proPersonProTag = input.verpflegung + input.transport + input.aktivitaeten + input.sonstiges;
  const verpflegungGesamt = input.verpflegung * input.personen * input.naechte;
  const transportGesamt = input.transport * input.personen * input.naechte;
  const aktivitaetenGesamt = input.aktivitaeten * input.personen * input.naechte;
  const sonstigesGesamt = input.sonstiges * input.personen * input.naechte;
  const gesamt = unterkunftGesamt + verpflegungGesamt + transportGesamt + aktivitaetenGesamt + sonstigesGesamt;
  return {
    unterkunftGesamt, verpflegungGesamt, transportGesamt, aktivitaetenGesamt, sonstigesGesamt,
    gesamt,
    proPerson: gesamt / input.personen,
    proTag: gesamt / input.naechte,
  };
}

function formatEUR(n) {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function calculate() {
  const input = {
    personen: parseFloat(document.getElementById('personen').value) || 1,
    naechte: parseFloat(document.getElementById('naechte').value) || 1,
    unterkunft: parseFloat(document.getElementById('unterkunft').value) || 0,
    verpflegung: parseFloat(document.getElementById('verpflegung').value) || 0,
    transport: parseFloat(document.getElementById('transport').value) || 0,
    aktivitaeten: parseFloat(document.getElementById('aktivitaeten').value) || 0,
    sonstiges: parseFloat(document.getElementById('sonstiges').value) || 0,
  };
  const r = computeBudget(input);
  document.getElementById('r-unterkunft').textContent = formatEUR(r.unterkunftGesamt);
  document.getElementById('r-verpflegung').textContent = formatEUR(r.verpflegungGesamt);
  document.getElementById('r-transport').textContent = formatEUR(r.transportGesamt);
  document.getElementById('r-aktivitaeten').textContent = formatEUR(r.aktivitaetenGesamt);
  document.getElementById('r-sonstiges').textContent = formatEUR(r.sonstigesGesamt);
  document.getElementById('r-gesamt').textContent = formatEUR(r.gesamt);
  document.getElementById('r-pro-person').textContent = formatEUR(r.proPerson);
  document.getElementById('r-pro-tag').textContent = formatEUR(r.proTag);
  document.getElementById('result-panel').style.display = 'block';
}

document.getElementById('preset').addEventListener('change', applyPreset);
document.getElementById('calc-btn').addEventListener('click', calculate);
