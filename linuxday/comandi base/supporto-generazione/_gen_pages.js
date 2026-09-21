"use strict";
/* ═══════════════════════════════════════════════════════════════
   GENERATORE TEMPORANEO — sezione "Comandi Base"
   Legge comandibase.html (nella cartella "comandi base"), estrae
   CSS, motore di simulazione e dati, e genera:
     - 9 pagine di categoria (una per gruppo di comandi)
     - la pagina panoramica comandibase.html (hub)
   Questo file è solo uno strumento di build: va eliminato dopo.
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..");

/* CSS, CATS, motore e funzioni condivise: presi da una pagina di categoria
   già generata. Dati dei comandi: dal file di ripristino _cmds_data.txt. */
const pageSample = fs.readFileSync(path.join(DIR, "navigazione.html"), "utf8");
const hub = fs.readFileSync(path.join(DIR, "comandibase.html"), "utf8");
const cmdsFull = fs.readFileSync(path.join(__dirname, "_cmds_data.txt"), "utf8");

const css = pageSample.match(/<style>([\s\S]*?)<\/style>/)[1];
const js = pageSample.match(/<script>([\s\S]*?)<\/script>/)[1];

function between(a, b) {
  const i = js.indexOf(a);
  const j = js.indexOf(b, i + a.length);
  if (i < 0 || j < 0) throw new Error("Marker non trovato: " + a + " / " + b);
  return js.substring(i, j).trimEnd() + "\n";
}

/* Dati delle categorie */
const catsSrc = between("const CATS = [", "const CMDS = [");

/* Motore di simulazione (costanti + funzioni di rendering terminale) */
const engineSrc = between("const DEFAULT_PROMPT", "function findCat");

/* Funzioni condivise delle pagine: findCat + buildCard */
const chunk1 = between("function findCat", "function toast");
/* Funzioni condivise delle pagine: toast + copia negli appunti */
const chunk2 = between("function toast", "const PAGE_CMDS");

/* Sezione introduttiva con l'anatomia del prompt (dalla pagina panoramica) */
const introHTML = hub.substring(
  hub.indexOf("<!-- INTRODUZIONE -->"),
  hub.indexOf("<!-- CATEGORIE -->")
);

const PAGES = [
  { id: "navigazione", file: "navigazione.html",   label: "Navigazione" },
  { id: "file",        file: "file-cartelle.html", label: "File e cartelle" },
  { id: "ricerca",     file: "ricerca.html",       label: "Ricerca" },
  { id: "sistema",     file: "sistema.html",       label: "Sistema e informazioni" },
  { id: "processi",    file: "processi.html",      label: "Processi" },
  { id: "permessi",    file: "permessi.html",      label: "Permessi" },
  { id: "pacchetti",   file: "pacchetti.html",     label: "Gestione software" },
  { id: "rete",        file: "rete.html",          label: "Rete" },
  { id: "utilita",     file: "utilita.html",       label: "Terminale e utilità" }
];

const FONTS = [
  '  <link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">'
].join("\n");

/* Estrae dall'array CMDS solo gli oggetti di una categoria */
function cmdsOf(id) {
  const re = /^    \{[\s\S]*?^    \},?\r?\n?/gm;
  const all = cmdsFull.match(re) || [];
  return all.filter(function (o) {
    return o.indexOf('cat: "' + id + '"') !== -1;
  }).join("\n");
}

/* Recupera l'introduzione di una categoria dal sorgente CATS */
function catIntro(id) {
  const re = new RegExp('id: "' + id + '"[\\s\\S]*?intro: "([^"]*)"');
  const m = catsSrc.match(re);
  return m ? m[1] : "";
}

/* Template del runtime delle pagine di categoria */
const INIT_TMPL = [
  'function renderCards() {',
  '  const list = document.getElementById("cmd-list");',
  '  PAGE_CMDS.forEach(function (cmd) { list.appendChild(buildCard(cmd)); });',
  '}',
  '',
  'function renderQuickNav() {',
  '  const nav = document.getElementById("quicknav");',
  '  PAGE_CMDS.forEach(function (cmd) {',
  '    const a = document.createElement("a");',
  '    a.href = "#cmd-" + cmd.c;',
  '    a.textContent = cmd.c;',
  '    a.dataset.target = "cmd-" + cmd.c;',
  '    nav.appendChild(a);',
  '  });',
  '}',
  '',
  'document.addEventListener("DOMContentLoaded", function () {',
  '  renderCards();',
  '  renderQuickNav();',
  '',
  '  const revealObs = new IntersectionObserver(function (entries) {',
  '    entries.forEach(function (entry) {',
  '      if (entry.isIntersecting) {',
  '        entry.target.classList.add("active");',
  '        revealObs.unobserve(entry.target);',
  '      }',
  '    });',
  '  }, { threshold: 0.08 });',
  '  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });',
  '',
  '  const termObs = new IntersectionObserver(function (entries) {',
  '    entries.forEach(function (entry) {',
  '      if (entry.isIntersecting) {',
  '        const card = entry.target.closest(".cmd-card");',
  '        termObs.unobserve(entry.target);',
  '        if (card && card._cmd) {',
  '          setTimeout(function () { runSim(entry.target, card._cmd); }, 350);',
  '        }',
  '      }',
  '    });',
  '  }, { threshold: 0.35 });',
  '  document.querySelectorAll(".cmd-card .term").forEach(function (el) { termObs.observe(el); });',
  '',
  '  const links = document.querySelectorAll("#quicknav a");',
  '  const spyObs = new IntersectionObserver(function (entries) {',
  '    entries.forEach(function (entry) {',
  '      if (entry.isIntersecting) {',
  '        links.forEach(function (l) {',
  '          l.classList.toggle("active", l.dataset.target === entry.target.id);',
  '        });',
  '      }',
  '    });',
  '  }, { rootMargin: "-20% 0px -70% 0px" });',
  '  document.querySelectorAll(".cmd-card").forEach(function (el) { spyObs.observe(el); });',
  '});'
].join("\n");

/* ═══════════════════════════════════════════════════════════════
   PAGINE DI CATEGORIA
   ═══════════════════════════════════════════════════════════════ */

function buildPage(page, prev, next) {
  const intro = catIntro(page.id);

  const pageScript = [
    '"use strict";',
    catsSrc,
    'const CMDS = [',
    cmdsOf(page.id),
    '];',
    engineSrc,
    chunk1,
    chunk2,
    'const PAGE_CMDS = CMDS;',
    INIT_TMPL
  ].join("\n");

  const navBtns = [];
  if (prev) navBtns.push('<a class="nav-link" href="' + prev.file + '">← ' + prev.label + '</a>');
  navBtns.push('<a class="nav-link" href="comandibase.html">Panoramica</a>');
  if (next) navBtns.push('<a class="nav-link" href="' + next.file + '">' + next.label + ' →</a>');

  const footBtns = [];
  if (prev) footBtns.push('<a class="button outline sm" href="' + prev.file + '">← ' + prev.label + '</a>');
  footBtns.push('<a class="button outline sm" href="comandibase.html">Tutte le categorie</a>');
  if (next) footBtns.push('<a class="button outline sm" href="' + next.file + '">' + next.label + ' →</a>');

  const html = [
    '<!DOCTYPE html>',
    '<html lang="it">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <meta name="description" content="PermissionOS — ' + page.label + ': comandi Linux spiegati con esempi pratici e terminali simulati.">',
    '  <title>PermissionOS — ' + page.label + ' | Comandi Base</title>',
    '',
    FONTS,
    '',
    '  <style>' + css + '  </style>',
    '</head>',
    '',
    '<body>',
    '',
    '  <div class="page">',
    '',
    '    <!-- TOPBAR -->',
    '    <div class="topbar">',
    '',
    '      <div class="brand">',
    '        PermissionOS — ' + page.label,
    '      </div>',
    '',
    '      <nav class="nav">',
    '        ' + navBtns.join('\n        '),
    '        <a class="nav-link" href="../index.html">Homepage</a>',
    '        <a class="nav-link" href="../permessi/index.html">Desktop</a>',
    '        <a class="nav-link" href="../permessi/permessi.html">Permessi</a>',
    '      </nav>',
    '',
    '    </div>',
    '',
    '',
    '    <!-- HERO -->',
    '    <section class="hero">',
    '',
    '      <div class="headline-tag">',
    '        <span></span>',
    '        Comandi Base — ' + page.label,
    '      </div>',
    '',
    '      <h1>' + page.label + '</h1>',
    '',
    '      <p>',
    '        ' + intro,
    '      </p>',
    '',
    '      <div class="button-group">',
    '        <a href="#comandi" class="button primary lg">Vai ai comandi</a>',
    '        <a href="comandibase.html" class="button outline lg">Tutte le categorie</a>',
    '      </div>',
    '',
    '    </section>',
    '',
    '',
    '    <!-- QUICK NAV COMANDI -->',
    '    <div class="quicknav" id="quicknav" aria-label="Comandi della sezione"></div>',
    '',
    '',
    '    <!-- COMANDI -->',
    '    <section class="section-block reveal" id="comandi">',
    '',
    '      <h2>I comandi di ' + page.label + '</h2>',
    '',
    '      <div class="cmd-list" id="cmd-list"></div>',
    '',
    '    </section>',
    '',
    '',
    '    <!-- FOOTER -->',
    '    <div class="footer">',
    '',
    '      <div>',
    '        PermissionOS — Sezione Didattica Comandi Base',
    '      </div>',
    '',
    '      <div style="display:flex;gap:8px;flex-wrap:wrap;">',
    '        ' + footBtns.join('\n        '),
    '      </div>',
    '',
    '    </div>',
    '',
    '  </div>',
    '',
    '  <!-- Toast per feedback (copia comandi) -->',
    '  <div id="toast">Comando copiato!</div>',
    '',
    '  <script>',
    pageScript,
    '  </script>',
    '</body>',
    '</html>'
  ].join('\n');

  fs.writeFileSync(path.join(DIR, page.file), html, 'utf8');
  return html.length;
}

PAGES.forEach(function (page, i) {
  const prev = i > 0 ? PAGES[i - 1] : null;
  const next = i < PAGES.length - 1 ? PAGES[i + 1] : null;
  const size = buildPage(page, prev, next);
  console.log('Generata ' + page.file + ' (' + size + ' byte)');
});

/* ═══════════════════════════════════════════════════════════════
   PAGINA PANORAMICA (comandibase.html)
   ═══════════════════════════════════════════════════════════════ */

const hubCss = [
  '',
  '  /* ── Griglia delle categorie (solo pagina panoramica) ───────── */',
  '  .hub-grid {',
  '    display: grid;',
  '    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));',
  '    gap: var(--space-md);',
  '    margin-top: var(--space-md);',
  '  }',
  '',
  '  .hub-card {',
  '    display: flex;',
  '    flex-direction: column;',
  '    gap: 10px;',
  '    background: rgba(17, 22, 33, 0.35);',
  '    border: 1px solid var(--border-subtle);',
  '    border-radius: var(--radius-md);',
  '    padding: var(--space-lg);',
  '    text-decoration: none;',
  '    color: inherit;',
  '    transition: all var(--transition-base);',
  '  }',
  '',
  '  .hub-card:hover {',
  '    transform: translateY(-3px);',
  '    border-color: rgba(16, 185, 129, 0.2);',
  '    background: rgba(22, 28, 43, 0.5);',
  '    box-shadow: var(--shadow-md);',
  '  }',
  '',
  '  .hub-title {',
  '    font-weight: 700;',
  '    font-size: var(--text-lg);',
  '    color: var(--text-primary);',
  '  }',
  '',
  '  .hub-desc {',
  '    font-size: var(--text-sm);',
  '    color: var(--text-secondary);',
  '    line-height: 1.55;',
  '    margin: 0;',
  '    flex: 1;',
  '  }',
  '',
  '  .hub-cmds {',
  '    font-family: var(--font-family-mono);',
  '    font-size: var(--text-xs);',
  '    color: var(--primary-light);',
  '  }'
].join('\n');

/* Elenco completo dei comandi: c, cat, name */
const cmdNameRe = /c: "([^"]+)", cat: "([^"]+)", name: "([^"]+)"/g;
const allCmds = [];
let m;
while ((m = cmdNameRe.exec(cmdsFull)) !== null) {
  allCmds.push({ c: m[1], cat: m[2], name: m[3] });
}

const quickChips = PAGES.map(function (p) {
  return '<a href="' + p.file + '">' + p.label + '</a>';
}).join('\n        ');

const hubCards = PAGES.map(function (p) {
  const list = allCmds.filter(function (c) { return c.cat === p.id; })
                      .map(function (c) { return c.c; }).join(' · ');
  return [
    '          <a class="hub-card" href="' + p.file + '">',
    '            <div class="hub-title">' + p.label + '</div>',
    '            <p class="hub-desc">' + catIntro(p.id) + '</p>',
    '            <div class="hub-cmds">' + list + '</div>',
    '          </a>'
  ].join('\n');
}).join('\n');

const summaryRows = allCmds.map(function (c) {
  const p = PAGES.find(function (x) { return x.id === c.cat; });
  return '            <tr><td><a class="nav-link" style="padding:0" href="' + p.file + '#cmd-' + c.c + '">' + c.c + '</a></td><td>' + p.label + '</td><td>' + c.name + '</td></tr>';
}).join('\n');

const mainScript = [
  '"use strict";',
  'document.addEventListener("DOMContentLoaded", function () {',
  '  const revealObs = new IntersectionObserver(function (entries) {',
  '    entries.forEach(function (entry) {',
  '      if (entry.isIntersecting) {',
  '        entry.target.classList.add("active");',
  '        revealObs.unobserve(entry.target);',
  '      }',
  '    });',
  '  }, { threshold: 0.08 });',
  '  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });',
  '});'
].join('\n');

const mainHTML = [
  '<!DOCTYPE html>',
  '<html lang="it">',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '  <meta name="description" content="PermissionOS — Guida interattiva ai comandi base di Linux, divisa in categorie con terminali simulati ed esempi pratici.">',
  '  <title>PermissionOS — Comandi Base di Linux</title>',
  '',
  FONTS,
  '',
  '  <style>' + css + hubCss + '  </style>',
  '</head>',
  '',
  '<body>',
  '',
  '  <div class="page">',
  '',
  '    <!-- TOPBAR -->',
  '    <div class="topbar">',
  '',
  '      <div class="brand">',
  '        PermissionOS — Comandi Base',
  '      </div>',
  '',
  '      <nav class="nav">',
  '        <a class="nav-link" href="../index.html">Homepage</a>',
  '        <a class="nav-link" href="../permessi/index.html">Desktop</a>',
  '        <a class="nav-link" href="../permessi/permessi.html">Permessi</a>',
  '      </nav>',
  '',
  '    </div>',
  '',
  '',
  '    <!-- HERO -->',
  '    <section class="hero">',
  '',
  '      <div class="headline-tag">',
  '        <span></span>',
  '        Guida interattiva',
  '      </div>',
  '',
  '      <h1>Comandi Base di Linux</h1>',
  '',
  '      <p>',
  '        Il terminale è lo strumento più potente di Linux: da qui puoi creare file,',
  '        spostarti tra le cartelle, gestire processi, permessi e molto altro.',
  '        La guida è divisa in categorie: scegli quella che ti interessa e impara',
  '        i comandi con spiegazioni, esempi e terminali simulati.',
  '      </p>',
  '',
  '      <div class="button-group">',
  '        <a href="#categorie" class="button primary lg">Scegli una categoria</a>',
  '        <a href="#riepilogo" class="button outline lg">Riepilogo dei comandi</a>',
  '      </div>',
  '',
  '    </section>',
  '',
  '',
  '    <!-- QUICK NAV CATEGORIE -->',
  '    <div class="quicknav" aria-label="Navigazione tra le categorie">',
  '        ' + quickChips,
  '    </div>',
  '',
  introHTML,
  '',
  '    <!-- CATEGORIE -->',
  '    <section class="section-block reveal" id="categorie">',
  '',
  '      <h2>Scegli una categoria</h2>',
  '',
  '      <p>',
  '        Ogni categoria è una pagina dedicata con i suoi comandi, le spiegazioni',
  '        dettagliate e i terminali simulati da eseguire.',
  '      </p>',
  '',
  '      <div class="hub-grid">',
  hubCards,
  '      </div>',
  '',
  '    </section>',
  '',
  '',
  '    <!-- RIEPILOGO -->',
  '    <section class="section-block reveal" id="riepilogo">',
  '',
  '      <h2>Riepilogo finale dei comandi</h2>',
  '',
  '      <p>',
  '        Tutti i comandi della guida, organizzati per categoria. Clicca su un',
  '        comando per aprire la sua scheda con la spiegazione e il terminale simulato.',
  '      </p>',
  '',
  '      <table class="summary-table">',
  '        <thead>',
  '          <tr>',
  '            <th>Comando</th>',
  '            <th>Categoria</th>',
  '            <th>A cosa serve</th>',
  '          </tr>',
  '        </thead>',
  '        <tbody>',
  summaryRows,
  '        </tbody>',
  '      </table>',
  '',
  '    </section>',
  '',
  '',
  '    <!-- FOOTER -->',
  '    <div class="footer">',
  '',
  '      <div>',
  '        PermissionOS — Sezione Didattica Comandi Base',
  '      </div>',
  '',
  '      <a href="../permessi/index.html" class="button outline sm">',
  '        Torna al Desktop simulato',
  '      </a>',
  '',
  '    </div>',
  '',
  '  </div>',
  '',
  '  <script>',
  mainScript,
  '  </script>',
  '</body>',
  '</html>'
].join('\n');

fs.writeFileSync(path.join(DIR, 'comandibase.html'), mainHTML, 'utf8');
console.log('Generata comandibase.html (panoramica) (' + mainHTML.length + ' byte)');
console.log('Comandi trovati: ' + allCmds.length);



