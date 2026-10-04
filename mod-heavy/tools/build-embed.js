#!/usr/bin/env node
/**
 * MOD-HEAVY — regenerate the file:// fallback embeds for the JSON-driven missions.
 *
 * missions/mN.json is the source of truth. Browsers block fetch() of local JSON
 * under file://, so js/mN-data.js carries an identical copy as a plain global
 * (no ES modules — they also break on file://).
 *
 *   Mission One  missions/m1.json -> js/m1-data.js  (window.MODHEAVY_M1_EMBED)
 *   Mission Two  missions/m2.json -> js/m2-data.js  (window.MODHEAVY_M2_EMBED)
 *
 * Usage:  node tools/build-embed.js              (writes every embed)
 *         node tools/build-embed.js m2           (writes one embed)
 *         node tools/build-embed.js --check      (exit 1 if any embed is stale)
 *         node tools/build-embed.js m1 --check   (check one)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const MISSIONS = {
  m1: { name: "Mission One", global: "MODHEAVY_M1_EMBED" },
  m2: { name: "Mission Two", global: "MODHEAVY_M2_EMBED" },
};

const args = process.argv.slice(2);
const check = args.includes("--check");
const picked = args.filter((a) => !a.startsWith("--"));
for (const id of picked) {
  if (!MISSIONS[id]) {
    console.error("unknown mission '" + id + "' (known: " + Object.keys(MISSIONS).join(", ") + ")");
    process.exit(2);
  }
}
const ids = picked.length ? picked : Object.keys(MISSIONS);

let stale = 0;
for (const id of ids) {
  const m = MISSIONS[id];
  const src = path.join(root, "missions", id + ".json");
  const out = path.join(root, "js", id + "-data.js");
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  const body =
    "/**\n" +
    " * MOD-HEAVY " + m.name + " — embedded mission data (file:// fallback).\n" +
    " * GENERATED from missions/" + id + ".json by tools/build-embed.js. Do not edit by hand.\n" +
    " */\n" +
    "window." + m.global + " = " +
    JSON.stringify(data, null, 2) +
    ";\n";
  const rel = path.relative(root, out);
  if (check) {
    const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (current !== body) {
      console.error(rel + " is out of date — run: node tools/build-embed.js " + id);
      stale = 1;
    } else {
      console.log(rel + " matches missions/" + id + ".json");
    }
  } else {
    fs.writeFileSync(out, body);
    console.log("wrote " + rel);
  }
}
process.exit(stale);
