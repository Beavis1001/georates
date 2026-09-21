// packliste.html - Logik des Rechners. Bis zum 21.09.2026 stand sie als Inline-Skript in der Seite;
// die CSP brauchte dafuer 'unsafe-inline'. Ausgelagert, damit alle Seiten dieselbe strenge
// CSP wie die Startseite bekommen und test/check.js Inline-Skripte ueberall verbieten kann.
// Wird am Ende des <body> geladen, das DOM steht also bereit.
// Reine, deterministische Regel-Logik - kein Backend, keine Datenuebertragung.
// Kategorien und Items werden ueber t() sprachabhaengig aufgeloest; die Kategorie-
// Schluessel ('Dokumente' etc.) dienen intern nur als stabile, unuebersetzte IDs.
const CAT_KEYS = {
  Dokumente: 'pl_cat_documents',
  Kleidung: 'pl_cat_clothing',
  Elektronik: 'pl_cat_electronics',
  Hygiene: 'pl_cat_hygiene',
  Sonstiges: 'pl_cat_other',
};

function buildPackingList(opts) {
  const days = opts.tage;
  const cats = {};
  const add = (cat, key, vars) => { (cats[cat] = cats[cat] || []).push(t(key, vars)); };

  // Basis fuer jede Reise
  add('Dokumente', 'pl_item_id');
  add('Dokumente', 'pl_item_bookings');
  add('Dokumente', 'pl_item_creditcard');
  add('Elektronik', 'pl_item_charger');
  add('Elektronik', 'pl_item_powerbank');
  add('Hygiene', 'pl_item_toothbrush');
  add('Hygiene', 'pl_item_deo');
  add('Kleidung', 'pl_item_underwear', { n: days + 1 });
  add('Kleidung', 'pl_item_socks', { n: days + 1 });
  add('Kleidung', 'pl_item_sleepwear');

  if (opts.klima === 'warm') {
    add('Kleidung', 'pl_item_tshirts');
    add('Kleidung', 'pl_item_shorts');
    add('Hygiene', 'pl_item_sunscreen');
    add('Sonstiges', 'pl_item_sunglasses');
  } else if (opts.klima === 'kalt') {
    add('Kleidung', 'pl_item_warmjacket');
    add('Kleidung', 'pl_item_hat_gloves');
    add('Kleidung', 'pl_item_sweater');
    add('Sonstiges', 'pl_item_lipbalm');
  } else {
    add('Kleidung', 'pl_item_lightjacket');
    add('Kleidung', 'pl_item_raingear');
  }

  if (opts.art === 'strand') {
    add('Sonstiges', 'pl_item_swimwear');
    add('Sonstiges', 'pl_item_beachtowel');
    add('Hygiene', 'pl_item_aftersun');
  } else if (opts.art === 'stadt') {
    add('Kleidung', 'pl_item_comfyshoes');
    add('Sonstiges', 'pl_item_daypack');
  } else if (opts.art === 'wandern') {
    add('Kleidung', 'pl_item_hikingboots');
    add('Kleidung', 'pl_item_functionalclothing');
    add('Sonstiges', 'pl_item_waterbottle');
    add('Sonstiges', 'pl_item_firstaid');
    add('Elektronik', 'pl_item_headlamp');
  } else if (opts.art === 'business') {
    add('Kleidung', 'pl_item_businessoutfit');
    add('Elektronik', 'pl_item_laptop');
    add('Dokumente', 'pl_item_businesscards');
  } else if (opts.art === 'winter') {
    add('Kleidung', 'pl_item_skijacket');
    add('Kleidung', 'pl_item_thermal');
    add('Sonstiges', 'pl_item_skigoggles');
    add('Hygiene', 'pl_item_sunscreen_snow');
  }

  if (opts.wasser) {
    add('Sonstiges', 'pl_item_swimtrunks');
    add('Sonstiges', 'pl_item_microfiber');
  }
  if (opts.kinder) {
    add('Sonstiges', 'pl_item_snackstoys');
    add('Hygiene', 'pl_item_diapering');
    add('Dokumente', 'pl_item_childid');
  }
  if (opts.flug) {
    add('Dokumente', 'pl_item_boardingpass');
    add('Hygiene', 'pl_item_liquids');
    add('Sonstiges', 'pl_item_neckpillow');
  }

  return cats;
}

function renderChecklist(cats) {
  const order = ['Dokumente', 'Kleidung', 'Elektronik', 'Hygiene', 'Sonstiges'];
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';
  order.filter(cat => cats[cat]).forEach(cat => {
    const heading = document.createElement('div');
    heading.className = 'checklist-cat';
    heading.textContent = t(CAT_KEYS[cat]);
    container.appendChild(heading);

    const ul = document.createElement('ul');
    ul.className = 'checklist';
    cats[cat].forEach((item, i) => {
      const li = document.createElement('li');
      const id = 'item-' + cat + '-' + i;
      li.innerHTML = `<input type="checkbox" id="${id}"><span>${item}</span>`;
      const checkbox = li.querySelector('input');
      checkbox.addEventListener('change', () => li.classList.toggle('checked', checkbox.checked));
      ul.appendChild(li);
    });
    container.appendChild(ul);
  });
}

let lastOpts = null;

function generate() {
  lastOpts = {
    art: document.getElementById('art').value,
    klima: document.getElementById('klima').value,
    tage: parseInt(document.getElementById('tage').value, 10) || 1,
    kinder: document.getElementById('opt-kinder').checked,
    wasser: document.getElementById('opt-wasser').checked,
    flug: document.getElementById('opt-flug').checked,
  };
  const cats = buildPackingList(lastOpts);
  renderChecklist(cats);
  document.getElementById('list-panel').style.display = 'block';
}

document.getElementById('gen-btn').addEventListener('click', generate);
document.getElementById('print-btn').addEventListener('click', () => window.print());

// Bei Sprachwechsel bereits angezeigte Packliste neu uebersetzen.
window.onLanguageChange = function () {
  if (lastOpts && document.getElementById('list-panel').style.display !== 'none') {
    const cats = buildPackingList(lastOpts);
    renderChecklist(cats);
  }
};
