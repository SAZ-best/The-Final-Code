"use strict";
/* Debug temporaneo dell'estrazione oggetti CMDS */
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "comandibase.html"), "utf8");
const js = src.match(/<script>([\s\S]*?)<\/script>/)[1];
let cmdsFull = js.substring(js.indexOf("const CMDS = ["));
console.log("cmdsFull length:", cmdsFull.length);
const idx = cmdsFull.indexOf('c: "pwd"');
console.log("indexOf c pwd:", idx);
console.log("contesto:", JSON.stringify(cmdsFull.substring(idx - 80, idx + 120)));
const re = /    \{[\s\S]*?\n    \},?\n/g;
const all = cmdsFull.match(re) || [];
console.log("match oggetti:", all.length);
const alt = /^      c: /m;
console.log("righe con 6 spazi c:", (js.match(/^      c: /gm) || []).length);
console.log("righe con 4 spazi graffa:", (js.match(/^    \{/gm) || []).length);
console.log("righe con 4 spazi graffa chiuso:", (js.match(/^    \},/gm) || []).length);
