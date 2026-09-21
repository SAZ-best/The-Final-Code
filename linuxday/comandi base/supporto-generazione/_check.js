"use strict";
/* Verifica temporanea: sintassi JS e conteggio comandi delle pagine generate */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const dir = path.join(__dirname, "..");
const files = [
  "navigazione.html", "file-cartelle.html", "ricerca.html", "sistema.html",
  "processi.html", "permessi.html", "pacchetti.html", "rete.html",
  "utilita.html", "comandibase.html"
];
const out = [];
files.forEach(function (f) {
  const h = fs.readFileSync(dir + "/" + f, "utf8");
  const i = h.indexOf("<" + "script>");
  const e = h.lastIndexOf("</" + "script>");
  const code = h.slice(i + 8, e);
  const n = (code.match(/c: "/g) || []).length;
  try {
    new vm.Script(code);
    out.push(f + ": JS OK, comandi=" + n);
  } catch (err) {
    out.push(f + ": ERR " + err.message);
  }
});
fs.writeFileSync(path.join(__dirname, "jscheck.txt"), out.join("\n"));
