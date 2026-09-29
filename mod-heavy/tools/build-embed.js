#!/usr/bin/env node
/**
 * MOD-HEAVY — regenerate the file:// fallback embed for Mission One.
 *
 * missions/m1.json is the source of truth. Browsers block fetch() of local JSON
 * under file://, so js/m1-data.js carries an identical copy as a plain global
 * (no ES modules — they also break on file://).
 *
 * Usage:  node tools/build-embed.js          (writes js/m1-data.js)
 *         node tools/build-embed.js --check  (exit 1 if the embed is stale)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "missions", "m1.json");
const out = path.join(root, "js", "m1-data.js");

const data = JSON.parse(fs.readFileSync(src, "utf8"));
const body =
  "/**\n" +
  " * MOD-HEAVY Mission One — embedded mission data (file:// fallback).\n" +
  " * GENERATED from missions/m1.json by tools/build-embed.js. Do not edit by hand.\n" +
  " */\n" +
  "window.MODHEAVY_M1_EMBED = " +
  JSON.stringify(data, null, 2) +
  ";\n";

if (process.argv.includes("--check")) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
  if (current !== body) {
    console.error("js/m1-data.js is out of date — run: node tools/build-embed.js");
    process.exit(1);
  }
  console.log("js/m1-data.js matches missions/m1.json");
} else {
  fs.writeFileSync(out, body);
  console.log("wrote " + path.relative(root, out));
}
