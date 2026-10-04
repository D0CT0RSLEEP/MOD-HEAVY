#!/usr/bin/env bash
# MOD-HEAVY smoke test: JS syntax, embed freshness, mission scoring integrity,
# fiction lint (documentation IPs / .example domains only), nav targets, and every
# referenced file returning 200 from a local static server (python3 -m http.server).
# Usage: bash tools/smoke-test.sh [port]
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${1:-8765}"
fail=0

echo "== node --check"
for f in js/*.js tools/*.js; do
  if node --check "$f"; then echo "  ok   $f"; else echo "  FAIL $f"; fail=1; fi
done

echo "== JSON parse"
for f in missions/*.json; do
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))"; then echo "  ok   $f"; else echo "  FAIL $f"; fail=1; fi
done

echo "== embeds match missions/m1.json + missions/m2.json"
node tools/build-embed.js --check || fail=1

echo "== mission scoring integrity (M1, M2: phases sum to 100, keys consistent)"
node - <<'NODE' || fail=1
const fs = require("fs");
let bad = 0;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const max = (a) => Math.max(...a);
for (const id of ["m1", "m2"]) {
  const m = JSON.parse(fs.readFileSync(`missions/${id}.json`, "utf8"));
  const errs = [];
  const total = m.detect.maxScore + m.decide.maxScore + m.contain.maxScore + m.document.maxScore;
  if (total !== 100 || m.debrief.maxScore !== 100) errs.push(`phase maxima sum to ${total}, debrief.maxScore ${m.debrief.maxScore}`);
  const hs = Object.values(m.detect.hotspots);
  if (sum(hs.map((h) => h.points)) !== m.detect.maxScore) errs.push("hotspot points != detect.maxScore");
  const scopeMax = m.decide.scopes ? sum(m.decide.scopes.map((q) => max(q.options.map((o) => o.points)))) : max(m.decide.scope.options.map((o) => o.points));
  const decideMax = max(m.decide.classification.options.map((o) => o.points)) + m.decide.justification.maxScore + scopeMax;
  if (decideMax !== m.decide.maxScore) errs.push(`decide best path ${decideMax} != ${m.decide.maxScore}`);
  if (m.decide.justification.options.filter((o) => o.correct).length * m.decide.justification.pointsEach < m.decide.justification.maxScore) errs.push("justification max unreachable");
  const req = sum(m.contain.actions.filter((a) => a.kind === "required").map((a) => a.points));
  if (req !== m.contain.maxScore) errs.push(`required containment ${req} != ${m.contain.maxScore}`);
  if (m.contain.actions.some((a) => a.kind !== "required" && a.kind !== "neutral" && a.points >= 0)) errs.push("non-required, non-neutral action without a penalty");
  if (sum(m.document.fields.map((f) => f.max)) !== m.document.maxScore) errs.push("document field maxima != document.maxScore");
  m.document.fields.forEach((f) => { if (sum(f.keys.map((k) => k.points)) < f.max) errs.push(`report field ${f.id} max unreachable`); });
  m.document.fields.forEach((f) => f.keys.forEach((k) => k.match.forEach((g) => g.forEach((t) => { try { new RegExp(t, "i"); } catch (e) { errs.push(`bad regex ${t}`); } }))));
  if (id === "m2") {
    const blob = JSON.stringify(m.detect.sources);
    const used = new Set((blob.match(/"hs":"([^"]+)"/g) || []).map((x) => x.slice(6, -1)));
    (blob.match(/,"([a-z]+-[a-z]+)"\]/g) || []).forEach((x) => used.add(x.slice(2, -2)));
    Object.keys(m.detect.hotspots).forEach((h) => { if (!used.has(h)) errs.push(`hotspot ${h} not placed in any source`); });
    used.forEach((h) => { if (!m.detect.hotspots[h]) errs.push(`source references unknown hotspot ${h}`); });
    Object.entries(m.detect.hotspots).forEach(([k, h]) => { if (!m.detect.sources.some((s) => s.id === h.source)) errs.push(`hotspot ${k} has unknown source`); });
  }
  if (errs.length) { bad = 1; errs.forEach((e) => console.log(`  FAIL ${id}: ${e}`)); } else console.log(`  ok   ${id} (100 = ${m.detect.maxScore}+${m.decide.maxScore}+${m.contain.maxScore}+${m.document.maxScore})`);
}
process.exit(bad);
NODE

echo "== fiction lint (documentation IPs, .example domains only)"
node - <<'NODE' || fail=1
const fs = require("fs");
const files = ["missions/m0.json", "missions/m1.json", "missions/m2.json", "js/main.js"];
const okIp = (ip) => /^(192\.0\.2|198\.51\.100|203\.0\.113)\.\d+$/.test(ip) || /^10\./.test(ip) || /^127\./.test(ip);
let bad = 0;
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  const issues = [];
  (text.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) || []).forEach((ip) => { if (!okIp(ip)) issues.push("non-documentation IP " + ip); });
  (text.match(/https?:\/\/[a-z0-9.-]+/gi) || []).forEach((u) => { const h = u.replace(/^https?:\/\//i, ""); if (!/\.example$/i.test(h)) issues.push("non-.example URL host " + h); });
  (text.match(/@[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi) || []).forEach((d) => { if (!/\.example$/i.test(d)) issues.push("non-.example mail domain " + d); });
  (text.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|ai|dev|co|app)\b/gi) || []).forEach((d) => issues.push("real-TLD domain " + d));
  if (issues.length) { bad = 1; [...new Set(issues)].forEach((i) => console.log(`  FAIL ${f}: ${i}`)); } else console.log(`  ok   ${f}`);
}
process.exit(bad);
NODE

echo "== every data-nav target exists as a view"
for t in $(grep -oE 'data-nav="[^"]+"' index.html | sed -E 's/data-nav="//; s/"$//' | sort -u); do
  if grep -q "data-view=\"$t\"" index.html; then echo "  ok   $t"; else echo "  FAIL $t (no data-view)"; fail=1; fi
done

echo "== no ES module syntax in browser scripts (breaks file://)"
if grep -nE '^\s*(import|export)\s' js/*.js || grep -n 'type="module"' index.html; then
  echo "  FAIL module syntax found"; fail=1
else
  echo "  ok"
fi

echo "== referenced files over http://127.0.0.1:$PORT/"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.2; done

# Relative src/href from index.html + paths fetched by the scripts.
paths=$( { echo "index.html"; \
  grep -oE '(src|href)="[^"#:]+"' index.html | sed -E 's/^(src|href)="//; s/"$//'; \
  grep -ohE 'fetch\("[^"]+"' js/*.js | sed -E 's/^fetch\("//; s/"$//'; } | sort -u )
for p in $paths; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/$p")
  if [ "$code" = "200" ]; then echo "  200  $p"; else echo "  $code  $p"; fail=1; fi
done

if [ "$fail" -eq 0 ]; then echo "SMOKE TEST PASSED"; else echo "SMOKE TEST FAILED"; exit 1; fi
